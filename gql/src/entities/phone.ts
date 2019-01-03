import { Field, ID, ObjectType } from "type-graphql";
import { PrimaryGeneratedColumn, Column, Entity, OneToMany, ManyToOne } from "typeorm";
import { Matches } from 'class-validator';

import { Lazy } from "../helpers";
import { Company } from "./company";
import { TopSoftkey } from "./top-softkey";
import { Softkey } from "./softkey";

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
  @Matches(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)
  ip?: string;

  @Field(type => Company)
  @ManyToOne(type => Company, { lazy: true })
  company!: Lazy<Company>;

  @Field(type => [Softkey])
  @OneToMany(type => Softkey, key => key.phone, { lazy: true, cascade: ["insert"]})
  softkeys!: Lazy<[Softkey]>;

  @Field(type => [TopSoftkey])
  @OneToMany(type => TopSoftkey, key => key.phone, { lazy: true, cascade: ["insert"]})
  topSoftkeys!: Lazy<[TopSoftkey]>;
}
