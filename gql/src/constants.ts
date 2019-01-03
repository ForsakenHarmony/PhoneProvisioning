import { registerEnumType } from "type-graphql";

export enum TopSoftkeyTypes {
  None = "",
  Line = "line",
  SpeedDial = "speeddial",
  DoNotDisturb = "dnd",
  BlfPrivacy = "blfprivacy",
  Blf = "blf",
  List = "list",
  Acd = "acd",
  Dcp = "dcp",
  XML = "xml",
  Flash = "flash",
  Spre = "spre",
  Park = "park",
  Pickup = "pickup",
  Lcr = "lcr",
  CallForward = "callforward",
  BlfXfer = "blfxfer",
  SpeedDialXfer = "speeddialxfer",
  SpeedDialConf = "speeddialconf",
  Directory = "directory",
  Filter = "filter",
  Callers = "callers",
  ReDial = "redial",
  Conf = "conf",
  Xfer = "xfer",
  Icom = "icom",
  PhoneLock = "phonelock",
  Paging = "paging",
  HotDeskLogin = "hotdesklogin",
  SpeedDialMwi = "speeddialmwi",
  DiscreetRinging = "discreetringing",
  Empty = "empty",
}

registerEnumType(TopSoftkeyTypes, {
  name: "TopSoftkeyTypes",
});

export enum SoftkeyTypes {
  None = "",
  SpeedDial = "speeddial",
  DoNotDisturb = "dnd",
  XML = "xml",
  Flash = "flash",
  Spre = "spre",
  Park = "park",
  Pickup = "pickup",
  Lcr = "lcr",
  CallForward = "callforward",
  SpeedDialXfer = "speeddialxfer",
  SpeedDialConf = "speeddialconf",
  Directory = "directory",
  Filter = "filter",
  Callers = "callers",
  ReDial = "redial",
  Conf = "conf",
  Xfer = "xfer",
  Icom = "icom",
  PhoneLock = "phonelock",
  Paging = "paging",
  HotDeskLogin = "hotdesklogin",
  DiscreetRinging = "discreetringing",
  History = "callhistory",
  Empty = "empty",
}

registerEnumType(SoftkeyTypes, {
  name: "SoftkeyTypes",
});

export const PhoneMessages = "PHONES";
