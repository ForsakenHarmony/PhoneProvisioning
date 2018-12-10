import { Field, InputType } from "type-graphql";
import { TopSoftkey } from "../../entities/top-softkey";
import { SoftkeyTypes } from "../../constants";

@InputType()
export class TopSoftkeyInput implements Partial<TopSoftkey> {
  @Field()
  type!: SoftkeyTypes;

  @Field()
  label?: string;

  @Field()
  value?: string;
}

