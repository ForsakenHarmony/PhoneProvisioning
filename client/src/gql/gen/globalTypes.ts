/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum PhoneStatus {
  Loading = "Loading",
  Nonexistent = "Nonexistent",
  Offline = "Offline",
  Online = "Online",
}

export enum SoftkeyTypes {
  CallForward = "CallForward",
  Callers = "Callers",
  Conf = "Conf",
  Directory = "Directory",
  DiscreetRinging = "DiscreetRinging",
  DoNotDisturb = "DoNotDisturb",
  Empty = "Empty",
  Filter = "Filter",
  Flash = "Flash",
  History = "History",
  HotDeskLogin = "HotDeskLogin",
  Icom = "Icom",
  Lcr = "Lcr",
  None = "None",
  Paging = "Paging",
  Park = "Park",
  PhoneLock = "PhoneLock",
  Pickup = "Pickup",
  ReDial = "ReDial",
  SpeedDial = "SpeedDial",
  SpeedDialConf = "SpeedDialConf",
  SpeedDialXfer = "SpeedDialXfer",
  Spre = "Spre",
  XML = "XML",
  Xfer = "Xfer",
}

export enum TopSoftkeyTypes {
  Acd = "Acd",
  Blf = "Blf",
  BlfPrivacy = "BlfPrivacy",
  BlfXfer = "BlfXfer",
  CallForward = "CallForward",
  Callers = "Callers",
  Conf = "Conf",
  Dcp = "Dcp",
  Directory = "Directory",
  DiscreetRinging = "DiscreetRinging",
  DoNotDisturb = "DoNotDisturb",
  Empty = "Empty",
  Filter = "Filter",
  Flash = "Flash",
  HotDeskLogin = "HotDeskLogin",
  Icom = "Icom",
  Lcr = "Lcr",
  Line = "Line",
  List = "List",
  None = "None",
  Paging = "Paging",
  Park = "Park",
  PhoneLock = "PhoneLock",
  Pickup = "Pickup",
  ReDial = "ReDial",
  SpeedDial = "SpeedDial",
  SpeedDialConf = "SpeedDialConf",
  SpeedDialMwi = "SpeedDialMwi",
  SpeedDialXfer = "SpeedDialXfer",
  Spre = "Spre",
  XML = "XML",
  Xfer = "Xfer",
}

export interface PhoneInput {
  id?: string | null;
  name: string;
  number: string;
  mac?: string | null;
  skipContacts?: boolean | null;
}

export interface RawCompanyInput {
  name: string;
  phones: RawPhoneInput[];
}

export interface RawPhoneInput {
  idx: number;
  name: string;
  number: string;
  type?: string | null;
  mac?: string | null;
  skipContacts?: boolean | null;
  softkeys: RawSoftkeyInput[];
  topSoftkeys: RawTopSoftkeyInput[];
}

export interface RawSoftkeyInput {
  type: SoftkeyTypes;
  label?: string | null;
  value?: string | null;
  line?: number | null;
  idle?: boolean | null;
  connected?: boolean | null;
  incoming?: boolean | null;
  outgoing?: boolean | null;
  busy?: boolean | null;
}

export interface RawTopSoftkeyInput {
  type: TopSoftkeyTypes;
  label?: string | null;
  value?: string | null;
  line?: number | null;
}

export interface SoftkeyInput {
  type: SoftkeyTypes;
  label?: string | null;
  value?: string | null;
  line?: number | null;
  idle?: boolean | null;
  connected?: boolean | null;
  incoming?: boolean | null;
  outgoing?: boolean | null;
  busy?: boolean | null;
}

export interface TopSoftkeyInput {
  type: TopSoftkeyTypes;
  label?: string | null;
  value?: string | null;
  line?: number | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
