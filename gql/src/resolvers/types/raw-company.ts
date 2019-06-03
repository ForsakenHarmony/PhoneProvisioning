import { Field, InputType, ObjectType } from "type-graphql";
import { SoftkeyTypes, TopSoftkeyTypes } from "../../constants";

@InputType("RawSoftkeyInput")
@ObjectType()
export class RawSoftkey {
  @Field(type => SoftkeyTypes)
  type!: SoftkeyTypes;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  line?: number;

  @Field({ nullable: true })
  idle?: boolean;

  @Field({ nullable: true })
  connected?: boolean;

  @Field({ nullable: true })
  incoming?: boolean;

  @Field({ nullable: true })
  outgoing?: boolean;

  @Field({ nullable: true })
  busy?: boolean;
}

@InputType("RawTopSoftkeyInput")
@ObjectType()
export class RawTopSoftkey {
  @Field(type => TopSoftkeyTypes)
  type!: TopSoftkeyTypes;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  line?: number;
}

@InputType("RawPhoneInput")
@ObjectType()
export class RawPhone {
  @Field()
  idx!: number;

  @Field()
  name!: string;

  @Field()
  number!: string;

  @Field({ nullable: true })
  mac?: string;

  @Field({ defaultValue: false })
  skipContacts!: boolean;

  @Field(type => [RawSoftkey])
  softkeys!: RawSoftkey[];

  @Field(type => [RawTopSoftkey])
  topSoftkeys!: RawTopSoftkey[];
}

@InputType("RawCompanyInput")
@ObjectType()
export class RawCompany {
  @Field()
  name!: string;
  @Field(type => [RawPhone])
  phones!: RawPhone[];
}
