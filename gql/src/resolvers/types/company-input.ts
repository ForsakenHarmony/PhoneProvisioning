import { Field, InputType } from "type-graphql";
import { Company } from "../../entities/company";

@InputType()
export class CompanyInput implements Partial<Company> {
  @Field()
  name!: string;
}

