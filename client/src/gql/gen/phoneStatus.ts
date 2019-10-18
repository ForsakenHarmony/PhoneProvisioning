/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { PhoneStatus, TopSoftkeyTypes, SoftkeyTypes } from "./globalTypes";

// ====================================================
// GraphQL subscription operation: phoneStatus
// ====================================================

export interface phoneStatus_phoneStatus_phone_topSoftkeys {
  id: string;
  type: TopSoftkeyTypes;
  label: string;
  value: string;
}

export interface phoneStatus_phoneStatus_phone_softkeys {
  id: string;
  type: SoftkeyTypes;
  label: string;
  value: string;
}

export interface phoneStatus_phoneStatus_phone {
  id: string;
  name: string;
  number: string;
  type: string | null;
  mac: string | null;
  status: PhoneStatus;
  skipContacts: boolean | null;
  topSoftkeys: phoneStatus_phoneStatus_phone_topSoftkeys[];
  softkeys: phoneStatus_phoneStatus_phone_softkeys[];
}

export interface phoneStatus_phoneStatus {
  phone: phoneStatus_phoneStatus_phone;
  date: any;
}

export interface phoneStatus {
  phoneStatus: phoneStatus_phoneStatus;
}
