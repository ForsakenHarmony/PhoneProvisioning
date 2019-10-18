/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SoftkeyInput, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addSoftkey
// ====================================================

export interface addSoftkey_addSoftkey_phone {
  id: string;
}

export interface addSoftkey_addSoftkey {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
  line: number;
  phone: addSoftkey_addSoftkey_phone;
}

export interface addSoftkey {
  addSoftkey: addSoftkey_addSoftkey;
}

export interface addSoftkeyVariables {
  phoneId: string;
  softkey: SoftkeyInput;
}
