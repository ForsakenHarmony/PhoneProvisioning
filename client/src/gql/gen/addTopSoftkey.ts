/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { TopSoftkeyInput, TopSoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addTopSoftkey
// ====================================================

export interface addTopSoftkey_addTopSoftkey_phone {
  id: string;
}

export interface addTopSoftkey_addTopSoftkey {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
  line: number;
  phone: addTopSoftkey_addTopSoftkey_phone;
}

export interface addTopSoftkey {
  addTopSoftkey: addTopSoftkey_addTopSoftkey;
}

export interface addTopSoftkeyVariables {
  phoneId: string;
  softkey: TopSoftkeyInput;
}
