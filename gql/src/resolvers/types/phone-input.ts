import { Field, InputType } from "type-graphql";
import { Phone } from "../../entities/phone";

@InputType()
export class PhoneInput implements Partial<Phone> {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name!: string;

  @Field()
  number!: string;

  @Field({ nullable: true })
  mac?: string;

  @Field({ defaultValue: false })
  skipContacts!: boolean;
}
