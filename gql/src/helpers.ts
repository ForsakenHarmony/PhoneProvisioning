import { Recipe } from "./recipe-type";

export function generateRecipes(count: number): Recipe[] {
  return new Array(count).fill(null).map(
    (_, i): Recipe => ({
      title: `Recipe #${i + 1}`,
      description: `Description #${i + 1}`,
      creationDate: new Date(),
    }),
  );
}

export type Lazy<T extends object> = Promise<T> | T;

export enum SoftkeyTypes {
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
