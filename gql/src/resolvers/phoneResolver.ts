import { Phone } from "../entities/phone";
import { Arg, FieldResolver, ID, Mutation, Publisher, Query, Resolver, Root, Subscription } from "type-graphql";
import { Company } from "../entities/company";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { PhoneInput } from "./types/phone-input";
import { TopSoftkey } from "../entities/top-softkey";
import { TopSoftkeyInput } from "./types/top-softkey-input";
import { PhoneNotification, PhoneNotificationPayload, PhoneStatus } from "./types/phone-notification";
import { PhoneApi } from "../api";
import { Softkey } from "../entities/softkey";
import { SoftkeyInput } from "./types/softkey-input";
import { PubSub } from "graphql-subscriptions";
import { PhoneApiProvider } from "../api/phone-api";
import { Container } from "typedi";
import { PhoneMessages } from "../constants";

@Resolver(Phone)
export class PhoneResolver {
  private watchedPhones: PhoneApi[] = [];
  private readonly publish: Publisher<PhoneNotificationPayload>;

  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(Phone) private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(TopSoftkey) private readonly topSoftkeyRepository: Repository<TopSoftkey>,
    @InjectRepository(Softkey) private readonly softkeyRepository: Repository<Softkey>
  ) {
    const pubSub = Container.get<PubSub>("PB");
    this.publish = pubSub.publish.bind(pubSub, PhoneMessages);
  }

  private getPhoneApi(phone: Phone): PhoneApi {
    const provider = Container.get(PhoneApiProvider);
    return provider.getPhoneApi(phone, this.publish);
  }

  private getPhoneApiById(id: string): Promise<PhoneApi> {
    return this.phoneRepository.findOneOrFail(id).then(this.getPhoneApi.bind(this));
  }

  @FieldResolver(returns => PhoneStatus)
  async status(@Root() phone: Phone): Promise<PhoneStatus> {
    if (!phone.mac) return PhoneStatus.Nonexistent;
    return this.getPhoneApi(phone).status;
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

    this.watchedPhones.map(api => api.watched = false);
    this.watchedPhones = (await company.phones).map(phone => {
      const api = this.getPhoneApi(phone);
      api.watched = true;
      return api;
    });

    return true;
  }

  @Mutation(returns => Phone)
  async addPhone(@Arg("companyId", type => ID) companyId: string, @Arg("phone") phoneInput: PhoneInput): Promise<Phone> {
    const company = await this.companyRepository.findOneOrFail(companyId, { relations: ["phones"] });
    const phones = await company.phones;

    const idx = phones.reduce((acc, val) => val.idx > acc ? val.idx : acc, 0) + 1;
    const phone = this.phoneRepository.create(Object.assign({ idx }, phoneInput));
    phones.push(phone);
    await this.companyRepository.save(company);

    return phone;
  }

  @Mutation(returns => [Phone])
  async movePhones(@Arg("from", type => ID) from: string, @Arg("to", type => ID) to: string): Promise<Phone[]> {
    const fromPhone = await this.phoneRepository.findOneOrFail(from);
    const toPhone = await this.phoneRepository.findOneOrFail(to);
    const company = await fromPhone.company;
    const toCompany = await toPhone.company;
    if (company.id !== toCompany.id)
      throw new Error("Can't move phones between companies");
    const phones = await company.phones;

    let passedFrom = false;
    let passedTo = false;

    let i = 0;
    while (!(passedFrom && passedTo) && i < phones.length) {
      const phone = phones[i];
      if (phone.id === from) {
        passedFrom = true;
      } else if (phone.id === to) {
        passedTo = true;
        fromPhone.idx = phone.idx;
        if (!passedFrom)
          phone.idx++;
        else
          phone.idx--;
      } else {
        if (passedFrom) {
          phone.idx--;
        }
        if (passedTo) {
          phone.idx++;
        }
      }
      i++;
    }

    await this.phoneRepository.save(phones);
    await this.phoneRepository.save(fromPhone);

    return phones;
  }

  @Mutation(returns => Phone)
  async updatePhone(@Arg("id", type => ID) id: string, @Arg("phone") phoneInput: PhoneInput): Promise<Phone> {
    const phone = await this.phoneRepository.findOneOrFail(id);

    Object.assign(phone, phoneInput);

    return await this.phoneRepository.save(phone);
  }

  @Mutation(returns => Phone)
  async removePhone(@Arg("id", type => ID) id: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOneOrFail(id);

    await this.topSoftkeyRepository.remove(await phone.topSoftkeys);
    await this.softkeyRepository.remove(await phone.softkeys);

    console.log("remove",  await this.phoneRepository.remove(phone));

    return Object.assign(phone, { id });
  }

  @Mutation(returns => TopSoftkey)
  async addTopSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") topSoftkeyInput: TopSoftkeyInput): Promise<TopSoftkey> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, { relations: ["topSoftkeys"] });

    const topSoftkey = this.topSoftkeyRepository.create(topSoftkeyInput);
    (await phone.topSoftkeys).push(topSoftkey);
    await this.phoneRepository.save(phone);

    return topSoftkey;
  }

  @Mutation(returns => TopSoftkey)
  async updateTopSoftkey(@Arg("id", type => ID) id: string, @Arg("softkey") topSoftkeyInput: TopSoftkeyInput): Promise<TopSoftkey> {
    const topSoftkey = await this.topSoftkeyRepository.findOneOrFail(id, { relations: ["phone"] });

    Object.assign(topSoftkey, topSoftkeyInput);

    return await this.topSoftkeyRepository.save(topSoftkey);
  }

  @Mutation(returns => TopSoftkey)
  async removeTopSoftkey(@Arg("id", type => ID) id: string): Promise<TopSoftkey> {
    const topSoftkey = await this.topSoftkeyRepository.findOneOrFail(id);

   await this.topSoftkeyRepository.remove(topSoftkey);

    return Object.assign(topSoftkey, { id });
  }

  @Mutation(returns => Softkey)
  async addSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") softkeyInput: SoftkeyInput): Promise<Softkey> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, { relations: ["softkeys"] });

    const softkey = this.softkeyRepository.create(softkeyInput);
    (await phone.softkeys).push(softkey);
    await this.phoneRepository.save(phone);

    return softkey;
  }

  @Mutation(returns => Softkey)
  async updateSoftkey(@Arg("id", type => ID) id: string, @Arg("softkey") topSoftkeyInput: SoftkeyInput): Promise<Softkey> {
    const softkey = await this.softkeyRepository.findOneOrFail(id, { relations: ["phone"] });

    Object.assign(softkey, topSoftkeyInput);

    return await this.softkeyRepository.save(softkey);
  }

  @Mutation(returns => Softkey)
  async removeSoftkey(@Arg("id", type => ID) id: string): Promise<Softkey> {
    const softkey = await this.softkeyRepository.findOneOrFail(id);

    await this.softkeyRepository.remove(softkey);

    return Object.assign(softkey, { id });
  }

  @Mutation(returns => Company)
  async copyToAll(@Arg("phoneId", type => ID) phoneId: string): Promise<Company> {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, { relations: ["topSoftkeys", "softkeys", "company"] });
    const company = await phone.company;
    const topSoftkeys = (await phone.topSoftkeys).map(key => {
      const newKey = Object.assign({}, key);
      // @ts-ignore
      delete newKey.id;
      return newKey;
    });
    const softkeys = (await phone.softkeys).map(key => {
      const newKey = Object.assign({}, key);
      // @ts-ignore
      delete newKey.id;
      return newKey;
    });
    const phones = await company.phones;
    phones.filter(p => p.id !== phone.id).forEach(phone => {
      phone.softkeys = Promise.resolve(this.softkeyRepository.create(softkeys));
      phone.topSoftkeys = Promise.resolve(this.topSoftkeyRepository.create(topSoftkeys));
    });
    return await this.companyRepository.save(company);
  }

  @Mutation(returns => Boolean)
  async resetPhone(@Arg("phoneId", type => ID) id: string) {
    const api = await this.getPhoneApiById(id);

    await api.reset();
    await api.restart();

    return true;
  }


  @Mutation(returns => Phone)
  async importConfigFromPhone(@Arg("id", type => ID) id: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOneOrFail(id);
    const api = await this.getPhoneApiById(id);

    const {
      softkeys,
      topSoftkeys
    } = await api.readSoftkeys();

    phone.softkeys = softkeys;
    phone.topSoftkeys = topSoftkeys;

    return await this.phoneRepository.save(phone);
  }

  @Mutation(returns => Boolean)
  async transferConfigToPhone(@Arg("phoneId", type => ID) phoneId: string) {
    const phone = await this.phoneRepository.findOneOrFail(phoneId, {
      relations: ["company"]
    });
    const phones = await (await phone.company).phones;

    const api = this.getPhoneApi(phone);
    await api.updateSoftkeys(await phone.softkeys);
    await api.updateTopSoftkeys(await phone.topSoftkeys, phone.skipContacts ? [] : phones.filter(p => p.id !== phone.id));

    return true;
  }

  @Subscription(returns => PhoneNotification, {
    topics: PhoneMessages
  })
  async phoneStatus(@Root() payload: PhoneNotificationPayload): Promise<PhoneNotification> {
    debugger;
    const phone = await this.phoneRepository.findOneOrFail(payload.id);

    return {
      phone,
      date: new Date(),
      status: payload.status,
    };
  }
}
