/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: copyToAll
// ====================================================

export interface copyToAll_copyToAll_phones {
  id: string;
}

export interface copyToAll_copyToAll {
  id: string;
  phones: copyToAll_copyToAll_phones[];
}

export interface copyToAll {
  copyToAll: copyToAll_copyToAll;
}

export interface copyToAllVariables {
  phoneId: string;
}
