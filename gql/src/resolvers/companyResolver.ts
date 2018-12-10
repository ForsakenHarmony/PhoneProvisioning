import { Company } from "../entities/company";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";
import { CompanyInput } from "./types/company-input";

@Resolver(Company)
export class CompanyResolver {
  constructor(
    @InjectRepository(Company) private readonly companyRepository: Repository<Company>
  ) {
  }

  @Query(returns => [Company])
  companies(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  @Query(returns => Company, { nullable: true })
  async company(@Arg("companyId", type => ID) companyId: string) {
    return this.companyRepository.findOne(companyId);
  }

  @Mutation(returns => Company)
  addCompany(@Arg("company") companyInput: CompanyInput): Promise<Company> {
    const company = this.companyRepository.create(companyInput);
    return this.companyRepository.save(company);
  }
}
