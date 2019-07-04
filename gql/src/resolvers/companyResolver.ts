import { Company } from "../entities/company";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { CompanyInput } from "./types/company-input";
import { Container } from "typedi";
import { Phone } from "../entities/phone";
import { RawCompany } from "./types/raw-company";
import { PhoneResolver } from "./phoneResolver";

@Resolver(Company)
export class CompanyResolver {
  constructor(
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(Phone) private readonly phoneRepo: Repository<Phone>,
  ) {
  }

  @Query(returns => [Company])
  companies(): Promise<Company[]> {
    return this.companyRepo.find();
  }

  @Query(returns => Company, { nullable: true })
  async company(@Arg("companyId", type => ID) companyId: string) {
    return this.companyRepo.findOne(companyId);
  }

  @Mutation(returns => Company)
  addCompany(@Arg("company") companyInput: CompanyInput): Promise<Company> {
    const company = this.phoneRepo.create(companyInput);
    return this.companyRepo.save(company);
  }

  @Mutation(returns => Company)
  async removeCompany(@Arg("companyId", type => ID) id: string): Promise<Company> {
    const company = await this.companyRepo.findOneOrFail(id);

    await this.companyRepo.remove(company);

    return Object.assign(company, { id });
  }

  @Mutation(returns => Boolean)
  async transferConfigToPhones(@Arg("companyId", type => ID) companyId: string) {
    const phones =await this.phoneRepo.find({
      where: {
        company: {
          id: companyId
        }
      }
    });

    const phoneResolver = Container.get(PhoneResolver);

    await Promise.all(phones.map(async phone => phoneResolver.transferConfigToPhone(phone.id)));

    return true;
  }

  @Mutation(returns => RawCompany)
  async exportCompany(@Arg("companyId", type => ID) companyId: string): Promise<RawCompany> {
    const company = await this.companyRepo.findOneOrFail(companyId, { relations: [ "phones" ] });
    const phones = await company.phones;
    return {
      name: company.name,
      phones: await Promise.all(phones.map(async phone => {
        const topSoftkeys = await phone.topSoftkeys;
        const softkeys = await phone.softkeys;
        return {
          idx: phone.idx,
          name: phone.name,
          number: phone.number,
          mac: phone.mac,
          skipContacts: phone.skipContacts,
          softkeys: softkeys.map(({ type, label, value, line, busy, connected, idle, incoming, outgoing }) => ({
            type,
            label,
            value,
            line,
            busy,
            connected,
            idle,
            incoming,
            outgoing
          })),
          topSoftkeys: topSoftkeys.map(({ type, label, value, line }) => ({ type, label, value, line })),
        }
      })),
    };
  }

  @Mutation(returns => Company)
  async importCompany(@Arg("company", type => RawCompany) rawCompany: RawCompany) {
    const company = this.companyRepo.create(rawCompany);
    return this.companyRepo.save(company);
  }
}
