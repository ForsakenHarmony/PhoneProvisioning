/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: movePhones
// ====================================================

export interface movePhones_movePhones_company {
  id: string;
}

export interface movePhones_movePhones {
  id: string;
  company: movePhones_movePhones_company;
}

export interface movePhones {
  movePhones: movePhones_movePhones[];
}

export interface movePhonesVariables {
  from: string;
  to: string;
}
