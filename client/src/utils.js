export function isLabelDisabled(a) {
  switch (a) {
    case "":
    case "dnd":
    case "xfer":
    case "conf":
    case "list":
    case "lcr":
    case "phonelock":
    case "callforward":
    case "empty":
    case "hotdesklogin":
    case "discreetringing":
    case "blfprivacy":
      return true;
    default:
      return false;
  }
}

export function isValueDisabled(a) {
  switch (a) {
    case "":
    case "line":
    case "dnd":
    case "list":
    case "flash":
    case "lcr":
    case "callforward":
    case "directory":
    case "redials":
    case "callers":
    case "xfer":
    case "conf":
    case "services":
    case "phonelock":
    case "acd":
    case "empty":
    case "save":
    case "delete":
    case "ldap":
    case "hotdesklogin":
    case "discreetringing":
    case "blfprivacy":
      return true;
    default:
      return false;
  }
}

export function isLineDisabled(a) {
  switch (a) {
    case "":
    case "dnd":
    case "xml":
    case "flash":
    case "spre":
    case "directory":
    case "redials":
    case "callers":
    case "xfer":
    case "conf":
    case "icom":
    case "services":
    case "callforward":
    case "phonelock":
    case "empty":
    case "save":
    case "delete":
    case "paging":
    case "park":
    case "pickup":
    case "ldap":
    case "hotdesklogin":
    case "discreetringing":
    case "blfprivacy":
      return true;
    default:
      return false;
  }
}
