/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SoftkeyInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateSoftkey
// ====================================================

export interface updateSoftkey_updateSoftkey_phone {
  id: string;
}

export interface updateSoftkey_updateSoftkey {
  id: string;
  phone: updateSoftkey_updateSoftkey_phone;
}

export interface updateSoftkey {
  updateSoftkey: updateSoftkey_updateSoftkey;
}

export interface updateSoftkeyVariables {
  id: string;
  softkey: SoftkeyInput;
}
