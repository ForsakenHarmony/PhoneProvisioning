import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { Phone } from "../../entities/phone";

@ObjectType()
export class PhoneNotification {
  @Field(type => Phone)
  phone!: Phone;

  @Field(type => Date)
  date!: Date;
}

export enum PhoneStatus {
  Nonexistent = "Nonexistent",
  Loading = "Loading",
  Online = "Online",
  Offline = "Offline"
}

registerEnumType(PhoneStatus, {
  name: "PhoneStatus",
});

export interface PhoneNotificationPayload {
  id: string;
}

