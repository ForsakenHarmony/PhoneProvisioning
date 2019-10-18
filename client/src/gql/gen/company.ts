/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL query operation: company
// ====================================================

export interface company_company_phones_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface company_company_phones_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface company_company_phones {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: company_company_phones_topSoftkeys[];
  softkeys: company_company_phones_softkeys[];
}

export interface company_company {
  id: string;
  name: string;
  phones: company_company_phones[];
}

export interface company {
  company: company_company | null;
}

export interface companyVariables {
  id: string;
}
