/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: findPhones
// ====================================================

export interface findPhones_findPhones_phones_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface findPhones_findPhones_phones_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface findPhones_findPhones_phones {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: findPhones_findPhones_phones_topSoftkeys[];
  softkeys: findPhones_findPhones_phones_softkeys[];
}

export interface findPhones_findPhones {
  id: string;
  name: string;
  phones: findPhones_findPhones_phones[];
}

export interface findPhones {
  findPhones: findPhones_findPhones;
}

export interface findPhonesVariables {
  companyId: string;
}
