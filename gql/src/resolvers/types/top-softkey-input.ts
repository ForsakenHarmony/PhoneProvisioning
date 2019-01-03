import { Field, InputType } from "type-graphql";
import { TopSoftkey } from "../../entities/top-softkey";
import { TopSoftkeyTypes } from "../../constants";
import { DeepPartial } from "typeorm";

@InputType()
export class TopSoftkeyInput implements DeepPartial<TopSoftkey> {
  @Field(type => TopSoftkeyTypes)
  type!: TopSoftkeyTypes;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  value?: string;

  @Field({ nullable: true })
  line?: number;
}

