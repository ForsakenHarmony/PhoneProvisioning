/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updatePhone
// ====================================================

export interface updatePhone_updatePhone_company {
  id: string;
}

export interface updatePhone_updatePhone {
  id: string;
  company: updatePhone_updatePhone_company;
}

export interface updatePhone {
  updatePhone: updatePhone_updatePhone;
}

export interface updatePhoneVariables {
  id: string;
  phone: PhoneInput;
}
