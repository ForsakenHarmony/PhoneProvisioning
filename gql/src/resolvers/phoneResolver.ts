import { Phone } from "../entities/phone";
import { Arg, FieldResolver, ID, Mutation, Publisher, PubSub, Resolver, Root, Subscription } from "type-graphql";
import { Company } from "../entities/company";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { PhoneInput } from "./types/phone-input";
import { TopSoftkey } from "../entities/top-softkey";
import { TopSoftkeyInput } from "./types/top-softkey-input";
import { PhoneMessages } from "../constants";
import { PhoneNotification, PhoneNotificationPayload, PhoneStatus } from "./types/phone-notification";
import { PhoneAPI } from "../phone";

@Resolver(Phone)
export class PhoneResolver {
  private watchedPhones: { [key: string]: PhoneAPI } = {};

  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(Phone) private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(TopSoftkey) private readonly topSoftkeyRepository: Repository<TopSoftkey>,
  ) {
    setInterval(this.checkPhones.bind(this), 2000);
  }

  checkPhones() {
    Promise.all(Object.keys(this.watchedPhones).map(async id => {
      const phone = this.watchedPhones[id];
      await phone.check();
    })).then(() => {
    });
  }

  @FieldResolver(returns => PhoneStatus)
  async status(@Root() { id, ip, company }: Phone, @PubSub(PhoneMessages) publish: Publisher<PhoneNotificationPayload>): Promise<PhoneStatus> {
    if (!this.watchedPhones[id]) {
      const { id: companyId } = await company;
      this.watchedPhones[id] = new PhoneAPI({ id, ip, companyId }, publish);
    }

    const api = this.watchedPhones[id];

    if (api.status === PhoneStatus.Loading) {
      await api.check();
    }

    return api.status;
  }

  @Mutation(returns => Boolean)
  async setActiveCompany(@Arg("companyId", type => ID) companyId: string, @PubSub(PhoneMessages) publish: Publisher<PhoneNotificationPayload>) {
    const company = await this.companyRepository.findOne(companyId, { relations: ["phones"] });
    if (!company)
      throw new Error("Invalid company ID");

    const phones = (await company.phones);
    await Promise.all(phones.map(async ({ id, ip, company }) => {
      if (!this.watchedPhones[id]) {
        const { id: companyId } = await company;
        this.watchedPhones[id] = new PhoneAPI({ id, ip, companyId }, publish);
      }
    }));
    this.checkPhones();

    return true;
  }

  @Mutation(returns => Phone)
  async addPhone(@Arg("companyId", type => ID) companyId: string, @Arg("phone") phoneInput: PhoneInput): Promise<Phone> {// find the recipe
    const company = await this.companyRepository.findOne(companyId, { relations: ["phones"] });
    if (!company)
      throw new Error("Invalid company ID");

    const phone = this.phoneRepository.create(phoneInput);

    (await company.phones).push(phone);

    await this.companyRepository.save(company);

    return phone;
  }

  @Mutation(returns => Phone)
  async removePhone(@Arg("phoneId", type => ID) phoneId: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOne(phoneId);
    if (!phone)
      throw new Error("Invalid phone ID");

    return await this.phoneRepository.remove(phone);
  }

  @Mutation(returns => TopSoftkey)
  async addTopSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") topSoftkeyInput: TopSoftkeyInput): Promise<TopSoftkey> {
    const phone = await this.phoneRepository.findOne(phoneId, { relations: ["topSoftkeys"] });
    if (!phone)
      throw new Error("Invalid phone ID");

    const topSoftkey = this.topSoftkeyRepository.create(topSoftkeyInput);

    (await phone.topSoftkeys).push(topSoftkey);

    await this.phoneRepository.save(phone);

    return topSoftkey;
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
