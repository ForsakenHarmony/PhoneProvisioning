import { Field, InputType } from "type-graphql";
import { TopSoftkey } from "../../entities/top-softkey";
import { SoftkeyTypes, TopSoftkeyTypes } from "../../constants";
import { Column, DeepPartial } from "typeorm";
import { Softkey } from "../../entities/softkey";

@InputType()
export class SoftkeyInput implements DeepPartial<Softkey> {
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

