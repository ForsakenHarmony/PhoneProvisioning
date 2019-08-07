import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Lazy } from "../helpers";
import { Phone } from "./phone";
import { SoftkeyTypes } from "../constants";

@ObjectType()
@Entity({
  orderBy: {
    idx: "ASC"
  }
})
export class Softkey {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string;

  @Field(type => Int)
  @Column({ default: 0 })
  idx!: number;

  @Field(type => SoftkeyTypes)
  @Column({ enum: Object.values(SoftkeyTypes) })
  type!: SoftkeyTypes;

  @Field()
  @Column({ default: "" })
  label!: string;

  @Field()
  @Column({ default: "" })
  value!: string;

  @Field()
  @Column({ default: 0 })
  line!: number;

  @Field()
  @Column({ default: true })
  idle!: boolean;

  @Field()
  @Column({ default: true })
  connected!: boolean;

  @Field()
  @Column({ default: true })
  incoming!: boolean;

  @Field()
  @Column({ default: true })
  outgoing!: boolean;

  @Field()
  @Column({ default: true })
  busy!: boolean;

  @Field(type => Phone)
  @ManyToOne(type => Phone, {
    lazy: true,
    onDelete: "CASCADE",
    nullable: false
  })
  phone!: Lazy<Phone>;
}
