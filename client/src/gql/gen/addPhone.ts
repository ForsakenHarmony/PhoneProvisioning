/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneInput, PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addPhone
// ====================================================

export interface addPhone_addPhone_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface addPhone_addPhone_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface addPhone_addPhone_company {
  id: string;
}

export interface addPhone_addPhone {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: addPhone_addPhone_topSoftkeys[];
  softkeys: addPhone_addPhone_softkeys[];
  company: addPhone_addPhone_company;
}

export interface addPhone {
  addPhone: addPhone_addPhone;
}

export interface addPhoneVariables {
  companyId: string;
  phone: PhoneInput;
}
