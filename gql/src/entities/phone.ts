import { Field, ID, ObjectType } from "type-graphql";
import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from "typeorm";

import { Lazy } from "../helpers";
import { Company } from "./company";
import { TopSoftkey } from "./top-softkey";

@ObjectType()
@Entity()
export class Phone {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  number!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ip!: string;

  @Field(type => Company)
  @ManyToOne(type => Company, { lazy: true })
  company!: Lazy<Company>;

  @Field(type => [TopSoftkey])
  @OneToMany(type => TopSoftkey, key => key.phone, { lazy: true, cascade: ["insert"]})
  topSoftkeys!: Lazy<[TopSoftkey]>;
}
