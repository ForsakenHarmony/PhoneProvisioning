import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, Int, ObjectType } from "type-graphql";
import { Lazy } from "../helpers";
import { Phone } from "./phone";
import { TopSoftkeyTypes } from "../constants";

@Entity()
@ObjectType()
export class TopSoftkey {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string;

  @Field(type => Int)
  @Column({ default: 0 })
  idx!: number;

  @Field(type => TopSoftkeyTypes)
  @Column({ enum: TopSoftkeyTypes })
  type!: TopSoftkeyTypes;

  @Field()
  @Column({ default: "" })
  label!: string;

  @Field()
  @Column({ default: "" })
  value!: string;

  @Field()
  @Column({ default: 0 })
  line!: number;

  @Field(type => Phone)
  @ManyToOne(type => Phone, { lazy: true, onDelete: "CASCADE" })
  phone!: Lazy<Phone>;
}
