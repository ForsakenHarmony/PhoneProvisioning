/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: moveSoftkey
// ====================================================

export interface moveSoftkey_moveSoftkey_phone {
  id: string;
}

export interface moveSoftkey_moveSoftkey {
  id: string;
  phone: moveSoftkey_moveSoftkey_phone;
}

export interface moveSoftkey {
  moveSoftkey: moveSoftkey_moveSoftkey[];
}

export interface moveSoftkeyVariables {
  from: string;
  to: string;
}
