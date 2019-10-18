/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { TopSoftkeyInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateTopSoftkey
// ====================================================

export interface updateTopSoftkey_updateTopSoftkey_phone {
  id: string;
}

export interface updateTopSoftkey_updateTopSoftkey {
  id: string;
  phone: updateTopSoftkey_updateTopSoftkey_phone;
}

export interface updateTopSoftkey {
  updateTopSoftkey: updateTopSoftkey_updateTopSoftkey;
}

export interface updateTopSoftkeyVariables {
  id: string;
  softkey: TopSoftkeyInput;
}
