import { Field, InputType } from "type-graphql";
import { TopSoftkey } from "../../entities/top-softkey";

@InputType()
export class TopSoftkeyInput implements Partial<TopSoftkey> {
  @Field()
  type!: string;

  @Field()
  label?: string;

  @Field()
  value?: string;
}

