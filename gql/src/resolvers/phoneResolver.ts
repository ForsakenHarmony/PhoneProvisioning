import { Phone } from "../entities/phone";
import { Arg, FieldResolver, ID, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from "type-graphql";
import { Company } from "../entities/company";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { PhoneInput } from "./types/phone-input";
import { TopSoftkey } from "../entities/top-softkey";
import { TopSoftkeyInput } from "./types/top-softkey-input";
import { PhoneMessages } from "../constants";
import { PhoneNotification, PhoneNotificationPayload, PhoneStatus } from "./types/phone-notification";
import { PhoneAPI } from "../phone";
import { Softkey } from "../entities/softkey";
import { SoftkeyInput } from "./types/softkey-input";
import { PubSub as PubSubEngine } from 'graphql-subscriptions';

@Resolver(Phone)
export class PhoneResolver {
  private watchedPhones: { [key: string]: PhoneAPI } = {};
  private watchedCompanies: string[] = [];
  private readonly publish: Publisher<PhoneNotificationPayload>;

  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(Phone) private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(TopSoftkey) private readonly topSoftkeyRepository: Repository<TopSoftkey>,
    @InjectRepository(Softkey) private readonly softkeyRepository: Repository<Softkey>,
    @PubSub() private readonly pubsub: PubSubEngine
  ) {
    this.publish = pubsub.publish.bind(pubsub, PhoneMessages);
    setInterval(this.checkPhones.bind(this), 2000);
  }

  checkPhones() {
    Promise.all(Object.keys(this.watchedPhones).map(async id => {
      const phone = this.watchedPhones[id];
      if (this.watchedCompanies.includes(phone.config.companyId))
        await phone.check();
    })).then(() => {
    });
  }

  private async getPhoneApi({ id, ip, company }: Phone): Promise<PhoneAPI> {
    return this.watchedPhones[id] || (this.watchedPhones[id] = new PhoneAPI({ id, ip, companyId: (await company).id }, this.publish), this.watchedPhones[id]);
  }

  private async getPhoneApiById(id: string): Promise<PhoneAPI> {
    return this.watchedPhones[id] || await this.phoneRepository.findOneOrFail(id).then(this.getPhoneApi.bind(this));
  }

  @FieldResolver(returns => PhoneStatus)
  async status(@Root() phone: Phone): Promise<PhoneStatus> {
    const api = await this.getPhoneApi(phone);

    if (api.status === PhoneStatus.Loading) {
      return await api.check();
    }

    await api.check();
    return api.status;
  }

  @Query(returns => Boolean)
  async checkPostList(@Arg("phoneId", type => ID) phoneId: string) {
    const api = await this.getPhoneApiById(phoneId);
    await api.ensurePushList();
    return true;
  }

  @Mutation(returns => Boolean)
  async setActiveCompany(@Arg("companyId", type => ID) companyId: string) {
    const company = await this.companyRepository.findOneOrFail(companyId, { relations: ["phones"] });

    this.watchedCompanies = [ company.id ];

    await Promise.all((await company.phones).map(phone => this.status(phone)));

    return true;
  }

  @Mutation(returns => Phone)
  async addPhone(@Arg("companyId", type => ID) companyId: string, @Arg("phone") phoneInput: PhoneInput): Promise<Phone> {// find the recipe
    const company = await this.companyRepository.findOneOrFail(companyId, { relations: ["phones"] });

    const phone = this.phoneRepository.create(phoneInput);
    (await company.phones).push(phone);
    await this.companyRepository.save(company);

    return phone;
  }

  @Mutation(returns => Phone)
  async removePhone(@Arg("phoneId", type => ID) phoneId: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId);

    await this.topSoftkeyRepository.remove(await phone.topSoftkeys);
    await this.softkeyRepository.remove(await phone.softkeys);

    return await this.phoneRepository.remove(phone);
  }

  @Mutation(returns => TopSoftkey)
  async addTopSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") topSoftkeyInput: TopSoftkeyInput): Promise<TopSoftkey> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, { relations: ["topSoftkeys"] });

    const topSoftkey = this.topSoftkeyRepository.create(topSoftkeyInput);
    (await phone.topSoftkeys).push(topSoftkey);
    await this.phoneRepository.save(phone);

    const api = await this.getPhoneApi(phone);
    if (await api.check() === PhoneStatus.Online) {
      await api.updateTopSoftkeys(await phone.topSoftkeys);
    }

    return topSoftkey;
  }

  @Mutation(returns => Softkey)
  async addSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") softkeyInput: SoftkeyInput): Promise<Softkey> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, { relations: ["softkeys"] });

    const softkey = this.softkeyRepository.create(softkeyInput);
    (await phone.softkeys).push(softkey);
    await this.phoneRepository.save(phone);

    const api = await this.getPhoneApi(phone);
    if (await api.check() === PhoneStatus.Online) {
      await api.updateSoftkeys(await phone.softkeys);
    }

    return softkey;
  }

  @Mutation(returns => Boolean)
  async resetPhone(@Arg("phoneId", type => ID) id: string) {
    const api = await this.getPhoneApiById(id);

    await api.reset();
    await api.restart();

    return true;
  }

  @Subscription({
    topics: PhoneMessages
  })
  phoneStatus(@Root() payload: PhoneNotificationPayload): PhoneNotification {
    return {
      ...payload,
      date: new Date()
    };
  }
}
