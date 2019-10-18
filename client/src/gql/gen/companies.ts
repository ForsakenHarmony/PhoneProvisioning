/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL query operation: companies
// ====================================================

export interface companies_companies_phones_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface companies_companies_phones_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface companies_companies_phones {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: companies_companies_phones_topSoftkeys[];
  softkeys: companies_companies_phones_softkeys[];
}

export interface companies_companies {
  id: string;
  name: string;
  phones: companies_companies_phones[];
}

export interface companies {
  companies: companies_companies[];
}
