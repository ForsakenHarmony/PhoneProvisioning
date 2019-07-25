import { Field, ID, Int, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { Matches, MaxLength } from 'class-validator';

import { Lazy } from "../helpers";
import { Company } from "./company";
import { TopSoftkey } from "./top-softkey";
import { Softkey } from "./softkey";

@ObjectType()
@Entity({
  orderBy: {
    idx: "ASC"
  }
})
export class Phone {
  @Field(type => ID)
  @PrimaryColumn({ generated: "uuid" })
  readonly id!: string;

  @Field(type => Int)
  @Column()
  idx!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  number!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Matches(/^(?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}$/)
  mac?: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  skipContacts!: boolean;

  @Field(type => Company)
  @ManyToOne(type => Company, { lazy: true, onDelete: "CASCADE" })
  company!: Lazy<Company>;

  @MaxLength(18)
  @Field(type => [Softkey])
  @OneToMany(type => Softkey, key => key.phone, { lazy: true, cascade: true })
  softkeys!: Lazy<Softkey[]>;

  @MaxLength(20)
  @Field(type => [TopSoftkey])
  @OneToMany(type => TopSoftkey, key => key.phone, { lazy: true, cascade: true })
  topSoftkeys!: Lazy<TopSoftkey[]>;
}
