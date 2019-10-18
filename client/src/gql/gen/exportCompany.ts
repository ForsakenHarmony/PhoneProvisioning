/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { SoftkeyTypes, TopSoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: exportCompany
// ====================================================

export interface exportCompany_exportCompany_phones_softkeys {
  type: SoftkeyTypes;
  label: string | null;
  value: string | null;
  line: number | null;
  busy: boolean | null;
  connected: boolean | null;
  idle: boolean | null;
  incoming: boolean | null;
  outgoing: boolean | null;
}

export interface exportCompany_exportCompany_phones_topSoftkeys {
  type: TopSoftkeyTypes;
  label: string | null;
  value: string | null;
  line: number | null;
}

export interface exportCompany_exportCompany_phones {
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  idx: number;
  skipContacts: boolean | null;
  softkeys: exportCompany_exportCompany_phones_softkeys[];
  topSoftkeys: exportCompany_exportCompany_phones_topSoftkeys[];
}

export interface exportCompany_exportCompany {
  name: string;
  phones: exportCompany_exportCompany_phones[];
}

export interface exportCompany {
  exportCompany: exportCompany_exportCompany;
}

export interface exportCompanyVariables {
  companyId: string;
}
