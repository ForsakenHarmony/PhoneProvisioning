import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Lazy } from "../helpers";
import { Phone } from "./phone";
import { SoftkeyTypes } from "../constants";

@Entity()
@ObjectType()
export class TopSoftkey {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string;

  @Field(type => SoftkeyTypes)
  @Column()
  type!: SoftkeyTypes;

  @Field()
  @Column()
  label?: string;

  @Field()
  @Column()
  value?: string;

  @Field(type => Phone)
  @ManyToOne(type => Phone, { lazy: true })
  phone!: Lazy<Phone>;
}