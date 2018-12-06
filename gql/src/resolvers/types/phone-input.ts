import { Field, InputType } from "type-graphql";
import { Phone } from "../../entities/phone";

@InputType()
export class PhoneInput implements Partial<Phone> {
  @Field()
  name!: string;

  @Field()
  number!: number;

  @Field({ nullable: true })
  ip?: string;
}

