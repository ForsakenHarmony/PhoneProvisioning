/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: moveTopSoftkey
// ====================================================

export interface moveTopSoftkey_moveTopSoftkey_phone {
  id: string;
}

export interface moveTopSoftkey_moveTopSoftkey {
  id: string;
  phone: moveTopSoftkey_moveTopSoftkey_phone;
}

export interface moveTopSoftkey {
  moveTopSoftkey: moveTopSoftkey_moveTopSoftkey[];
}

export interface moveTopSoftkeyVariables {
  from: string;
  to: string;
}
