import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Field, ID, ObjectType } from "type-graphql";
import { Phone } from "./phone";
import { Lazy } from "../helpers";

@Entity()
@ObjectType()
export class Company {
  @Field(type => ID)
  @PrimaryGeneratedColumn("uuid")
  readonly id!: string;

  @Field()
  @Column()
  name!: string;

  @Field(type => [Phone], { defaultValue: [] })
  @OneToMany(type => Phone, phone => phone.company, {
    lazy: true,
    cascade: true
  })
  phones!: Lazy<Phone[]>;
}
