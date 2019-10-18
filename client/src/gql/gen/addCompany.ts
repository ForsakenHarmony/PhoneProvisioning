/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addCompany
// ====================================================

export interface addCompany_addCompany_phones_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface addCompany_addCompany_phones_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface addCompany_addCompany_phones {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: addCompany_addCompany_phones_topSoftkeys[];
  softkeys: addCompany_addCompany_phones_softkeys[];
}

export interface addCompany_addCompany {
  id: string;
  name: string;
  phones: addCompany_addCompany_phones[];
}

export interface addCompany {
  addCompany: addCompany_addCompany;
}

export interface addCompanyVariables {
  name: string;
}
