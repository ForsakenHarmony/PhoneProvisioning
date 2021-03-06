export const definition = {
  error: "Error",
  leave_free: "Tastenfelder frei lassen",
  phones: "Telefone",
  phone_provisioning: "Telefon Config",
  transfer_config: "Konfig Übertragen",
  loading: "Wird geladen ...",
  new_phone: "Neu",
  new_company: "Neuer Kunde",
  name: "Name",
  number: "Nummer",
  mac: "Mac Adresse",
  label: "Beschrift.",
  value: "Wert",
  copy: "Kopieren",
  copy_to_all: "Zu allen kopieren",
  save: "Speichern",
  no_phones: "Keine Telefone",
  create_company: "Erstellen",
  status: "Status",
  nonexistent: "Existiert nicht (keine Mac Adresse?)",
  online: "Online",
  offline: "Nicht erreichbar",
  add_softkey: "Softkey hinzufügen",
  top_softkeys: "Top Softkeys",
  softkeys: "Softkeys",
  edit_softkey: "Softkey bearbeiten",
  export: "Konfig exportieren",
  import: "Konfig importieren",
  import_softkeys: "Softkeys importieren",
  remove_company: "Kunden löschen",
  with_contacts: "Mit Kontakten",
  without_contacts: "Ohne Kontakte",
  find_phones: "Telefone suchen",
  softkey: {
    "": "Kein",
    line: "Leitung",
    speeddial: "Direktwahl",
    dnd: "Bitte nicht stören",
    blfprivacy: "BLF Privacy",
    blf: "BLF",
    list: "BLF/Liste",
    acd: "Automatische Anrufverteilung",
    dcp: "Direkt Abnehmen",
    xml: "XML",
    flash: "Flash",
    spre: "Sprecode",
    park: "Parken",
    pickup: "Abnehmen",
    lcr: "Letzter Rückruf",
    callforward: "RufUml.f",
    blfxfer: "BLF/Weiterltg.",
    speeddialxfer: "Direktwahl/Weiterltg.",
    speeddialconf: "Direktwahl/Konf.",
    directory: "Telefonbuch",
    filter: "Filter",
    callers: "Anrufliste",
    redial: "Wahlw.",
    conf: "Konf.",
    xfer: "Weiterl.",
    icom: "Gegenspr.",
    phonelock: "Telefonsperre",
    paging: "Paging",
    hotdesklogin: "Log-In",
    speeddialmwi: "Direktwahl/MWI",
    discreetringing: "Discreet Ringing",
    callhistory: "Call History",
    empty: "Leer"
  }
};

export const EnumToTopSoftkey = {
  None: "",
  Line: "line",
  SpeedDial: "speeddial",
  DoNotDisturb: "dnd",
  BlfPrivacy: "blfprivacy",
  Blf: "blf",
  List: "list",
  Acd: "acd",
  Dcp: "dcp",
  XML: "xml",
  Flash: "flash",
  Spre: "spre",
  Park: "park",
  Pickup: "pickup",
  Lcr: "lcr",
  CallForward: "callforward",
  BlfXfer: "blfxfer",
  SpeedDialXfer: "speeddialxfer",
  SpeedDialConf: "speeddialconf",
  Directory: "directory",
  Filter: "filter",
  Callers: "callers",
  ReDial: "redial",
  Conf: "conf",
  Xfer: "xfer",
  Icom: "icom",
  PhoneLock: "phonelock",
  Paging: "paging",
  HotDeskLogin: "hotdesklogin",
  SpeedDialMwi: "speeddialmwi",
  DiscreetRinging: "discreetringing",
  Empty: "empty"
};

export const topSoftkeyTypes = Object.values(EnumToTopSoftkey);
export const TopSoftkeyToEnum = (Object.keys(EnumToTopSoftkey) as (keyof typeof EnumToTopSoftkey)[]).reduce(
  (acc, val) =>
    Object.assign(acc, {
      [EnumToTopSoftkey[val]]: val
    }),
  {}
);

export const EnumToSoftkey = {
  None: "",
  SpeedDial: "speeddial",
  DoNotDisturb: "dnd",
  XML: "xml",
  Flash: "flash",
  Spre: "spre",
  Park: "park",
  Pickup: "pickup",
  Lcr: "lcr",
  CallForward: "callforward",
  SpeedDialXfer: "speeddialxfer",
  SpeedDialConf: "speeddialconf",
  Directory: "directory",
  Filter: "filter",
  Callers: "callers",
  ReDial: "redial",
  Conf: "conf",
  Xfer: "xfer",
  Icom: "icom",
  PhoneLock: "phonelock",
  Paging: "paging",
  HotDeskLogin: "hotdesklogin",
  DiscreetRinging: "discreetringing",
  History: "callhistory",
  Empty: "empty"
};

export const softkeyTypes = Object.values(EnumToSoftkey);
export const SoftkeyToEnum = (Object.keys(EnumToSoftkey) as (keyof typeof EnumToSoftkey)[]).reduce(
  (acc, val) =>
    Object.assign(acc, {
      [EnumToSoftkey[val]]: val
    }),
  {}
);
