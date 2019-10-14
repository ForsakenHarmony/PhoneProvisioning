export class Company {
  readonly id!: string;
  name!: string;
  phones!: Phone[];
}

export class Phone {
  readonly id!: string;
  idx!: number;
  name!: string;
  number!: string;
  type?: string;
  mac?: string;
  skipContacts!: boolean;
  company!: Company;
  softkeys!: Softkey[];
  topSoftkeys!: TopSoftkey[];
  status?: "Nonexistent" | "Loading" | "Online" | "Offline";
}

export class Softkey {
  readonly id!: string;
  idx?: number;
  type!: SoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
  idle?: boolean;
  connected?: boolean;
  incoming?: boolean;
  outgoing?: boolean;
  busy?: boolean;
  phone?: Phone;
}

export class TopSoftkey {
  readonly id!: string;
  idx?: number;
  type!: TopSoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
  phone?: Phone;
}

export type CommonSoftkey = {
  id: string,
  idx?: number,
  type: string,
  label?: string,
  value?: string,
};

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
  Empty = "empty"
}

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
  Empty = "empty"
}

export class PhoneInput implements Partial<Phone> {
  id?: string;
  name!: string;
  number!: string;
  mac?: string;
  skipContacts?: boolean;
}

export declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

export class TopSoftkeyInput implements DeepPartial<TopSoftkey> {
  type!: TopSoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
}

export class SoftkeyInput implements DeepPartial<Softkey> {
  type!: SoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
  idle?: boolean;
  connected?: boolean;
  incoming?: boolean;
  outgoing?: boolean;
  busy?: boolean;
}

export class RawSoftkey {
  type!: SoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
  idle?: boolean;
  connected?: boolean;
  incoming?: boolean;
  outgoing?: boolean;
  busy?: boolean;
}

export class RawTopSoftkey {
  type!: TopSoftkeyTypes;
  label?: string;
  value?: string;
  line?: number;
}

export class RawPhone {
  idx!: number;
  name!: string;
  number!: string;
  type?: string;
  mac?: string;
  skipContacts!: boolean;
  softkeys!: RawSoftkey[];
  topSoftkeys!: RawTopSoftkey[];
}

export class RawCompany {
  name!: string;
  phones!: RawPhone[];
}
