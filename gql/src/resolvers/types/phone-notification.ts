import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { Phone } from "../../entities/phone";

@ObjectType()
export class PhoneNotification {
  @Field(type => ID)
  id!: string;

  @Field()
  status!: PhoneStatus;

  @Field(type => Date)
  date!: Date;
}

export enum PhoneStatus {
  Nonexistent,
  Loading,
  Online,
  Offline
}

registerEnumType(PhoneStatus, {
  name: "PhoneStatus",
});

export interface PhoneNotificationPayload {
  id: string;
  status: PhoneStatus;
}

