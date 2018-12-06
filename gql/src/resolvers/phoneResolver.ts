import { Phone } from "../entities/phone";
import { Arg, ID, Mutation, Resolver } from "type-graphql";
import { Company } from "../entities/company";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { PhoneInput } from "./types/phone-input";
import { TopSoftkey } from "../entities/top-softkey";
import { TopSoftkeyInput } from "./types/top-softkey-input";

@Resolver(Phone)
export class PhoneResolver {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>,
    @InjectRepository(Phone) private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(TopSoftkey) private readonly topSoftkeyRepository: Repository<TopSoftkey>,
  ) {}

  @Mutation(returns => Phone)
  async addPhone(@Arg("companyId", type => ID) companyId: string, @Arg("phone") phoneInput: PhoneInput): Promise<Phone> {// find the recipe
    const company = await this.companyRepository.findOne(companyId, {
      relations: ["phones"], // preload the relation as we will modify it
    });
    if (!company) {
      throw new Error("Invalid company ID");
    }

    const phone = this.phoneRepository.create(phoneInput);

    (await company.phones).push(phone);

    await this.companyRepository.save(company);

    return phone;
  }

  @Mutation(returns => Phone)
  async removePhone(@Arg("phoneId", type => ID) phoneId: string): Promise<Phone> {
    const phone = await this.phoneRepository.findOne(phoneId);
    if (!phone) {
      throw new Error("Invalid phone ID");
    }

    return await this.phoneRepository.remove(phone);
  }

  @Mutation(returns => TopSoftkey)
  async addTopSoftkey(@Arg("phoneId", type => ID) phoneId: string, @Arg("softkey") topSoftkeyInput: TopSoftkeyInput): Promise<TopSoftkey> {
    const phone = await this.phoneRepository.findOne(phoneId, {
      relations: ["topSoftkeys"], // preload the relation as we will modify it
    });
    if (!phone) {
      throw new Error("Invalid phone ID");
    }

    const topSoftkey = this.topSoftkeyRepository.create(topSoftkeyInput);

    (await phone.topSoftkeys).push(topSoftkey);

    await this.phoneRepository.save(phone);

    return topSoftkey;
  }

}
