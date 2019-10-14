import { gql } from "@pql/macro";
import {
  Company,
  Phone,
  PhoneInput,
  SoftkeyInput,
  TopSoftkeyInput,
  RawCompany
} from "./types";

export const companies = gql`
  query companies {
    companies {
      id
      name
      phones {
        id
        name
        number
        type
        mac
        status
        skipContacts
        topSoftkeys {
          id
          type
          label
          value
        }
        softkeys {
          id
          type
          label
          value
        }
      }
    }
  }
`;

export interface CompaniesQuery {
  companies: Company[];
}

export const company = gql`
  query company($id: ID!) {
    company(companyId: $id) {
      id
      name
      phones {
        id
        name
        number
        type
        mac
        status
        skipContacts
        topSoftkeys {
          id
          type
          label
          value
        }
        softkeys {
          id
          type
          label
          value
        }
      }
    }
  }
`;

export interface CompanyQueryArgs {
  id: string;
}

export interface CompanyQuery {
  company: Company;
}

export const addCompany = gql`
  mutation addCompany($name: String!) {
    addCompany(company: { name: $name }) {
      id
      name
      phones {
        id
        name
        number
        type
        mac
        status
        skipContacts
        topSoftkeys {
          id
          type
          label
          value
        }
        softkeys {
          id
          type
          label
          value
        }
      }
    }
  }
`;

export interface AddCompanyMutationArgs {
  name: string;
}

export const setActiveCompany = gql`
  mutation setActiveCompany($id: ID!) {
    setActiveCompany(companyId: $id)
  }
`;

export interface SetActiveCompanyMutationArgs {
  id: string;
}

export const addPhone = gql`
  mutation addPhone($companyId: ID!, $phone: PhoneInput!) {
    addPhone(companyId: $companyId, phone: $phone) {
      id
      name
      number
      type
      mac
      status
      skipContacts
      topSoftkeys {
        id
        type
        label
        value
      }
      softkeys {
        id
        type
        label
        value
      }
      company {
        id
      }
    }
  }
`;

export interface AddPhoneMutationArgs {
  companyId: string;
  phone: PhoneInput;
}

export const movePhones = gql`
  mutation movePhones($from: ID!, $to: ID!) {
    movePhones(from: $from, to: $to) {
      id
      company {
        id
      }
    }
  }
`;

export interface MovePhoneMutationArgs {
  from: string;
  to: string;
}

export const copyToAll = gql`
  mutation copyToAll($phoneId: ID!) {
    copyToAll(phoneId: $phoneId) {
      id
      phones {
        id
      }
    }
  }
`;

export interface CopyToAllMutationArgs {
  phoneId: string;
}

export const removePhone = gql`
  mutation removePhone($id: ID!) {
    removePhone(id: $id) {
      id
    }
  }
`;

export interface RemovePhoneMutationArgs {
  id: string;
}

export const updatePhone = gql`
  mutation updatePhone($id: ID!, $phone: PhoneInput!) {
    updatePhone(id: $id, phone: $phone) {
      id
      company {
        id
      }
    }
  }
`;

export interface UpdatePhoneMutationArgs {
  id: string;
  phone: PhoneInput;
}

export const addTopSoftkey = gql`
  mutation addTopSoftkey($phoneId: ID!, $softkey: TopSoftkeyInput!) {
    addTopSoftkey(phoneId: $phoneId, softkey: $softkey) {
      id
      type
      label
      value
      line
      phone {
        id
      }
    }
  }
`;

export interface AddTopSoftkeyMutationArgs {
  phoneId: string;
  softkey: TopSoftkeyInput;
}

export const removeTopSoftkey = gql`
  mutation removeTopSoftkey($id: ID!) {
    removeTopSoftkey(id: $id) {
      id
    }
  }
`;

export interface RemoveTopSoftkeyMutationArgs {
  id: string;
}

export const updateTopSoftkey = gql`
  mutation updateTopSoftkey($id: ID!, $softkey: TopSoftkeyInput!) {
    updateTopSoftkey(id: $id, softkey: $softkey) {
      id
      phone {
        id
      }
    }
  }
`;

export interface UpdateTopSoftkeyMutationArgs {
  id: string;
  softkey: TopSoftkeyInput;
}

export const addSoftkey = gql`
  mutation addSoftkey($phoneId: ID!, $softkey: SoftkeyInput!) {
    addSoftkey(phoneId: $phoneId, softkey: $softkey) {
      id
      type
      label
      value
      line
      phone {
        id
      }
    }
  }
`;

export interface AddSoftkeyMutationArgs {
  phoneId: string;
  softkey: SoftkeyInput;
}

export const removeSoftkey = gql`
  mutation removeSoftkey($id: ID!) {
    removeSoftkey(id: $id) {
      id
    }
  }
`;

export interface RemoveSoftkeyMutationArgs {
  id: string;
}

export const updateSoftkey = gql`
  mutation updateSoftkey($id: ID!, $softkey: SoftkeyInput!) {
    updateSoftkey(id: $id, softkey: $softkey) {
      id
      phone {
        id
      }
    }
  }
`;

export interface UpdateSoftkeyMutationArgs {
  id: string;
  softkey: SoftkeyInput;
}

export const moveSoftkey = gql`
  mutation moveSoftkey($from: ID!, $to: ID!) {
    moveSoftkey(from: $from, to: $to) {
      id
      phone {
        id
      }
    }
  }
`;

export interface MoveSoftkeyMutationArgs {
  from: string;
  to: string;
}

export const moveTopSoftkey = gql`
  mutation moveTopSoftkey($from: ID!, $to: ID!) {
    moveTopSoftkey(from: $from, to: $to) {
      id
      phone {
        id
      }
    }
  }
`;

export interface MoveTopSoftkeyMutationArgs {
  from: string;
  to: string;
}

export const transferConfig = gql`
  mutation transferConfig($phoneId: ID!) {
    transferConfigToPhone(phoneId: $phoneId)
  }
`;

export interface TransferConfigMutationArgs {
  phoneId: string;
}

export const transferConfigToAll = gql`
  mutation transferConfig($companyId: ID!) {
    transferConfigToPhones(companyId: $companyId)
  }
`;

export interface TransferConfigToAllMutationArgs {
  companyId: string;
}

export const phoneStatus = gql`
  subscription phoneStatus {
    phoneStatus {
      phone {
        id
        name
        number
        type
        mac
        status
        skipContacts
        topSoftkeys {
          id
          type
          label
          value
        }
        softkeys {
          id
          type
          label
          value
        }
      }
      date
    }
  }
`;

export interface PhoneStatusSubscription {
  phoneStatus: {
    phone: Phone;
    date: string;
  };
}

export const exportCompany = gql`
  mutation exportCompany($companyId: ID!) {
    exportCompany(companyId: $companyId) {
      name
      phones {
        name
        number
        type
        mac
        idx
        skipContacts
        softkeys {
          type
          label
          value
          line
          busy
          connected
          idle
          incoming
          outgoing
        }
        topSoftkeys {
          type
          label
          value
          line
        }
      }
    }
  }
`;

export interface ExportCompanyMutationArgs {
  companyId: string;
}

export const importCompany = gql`
  mutation importCompany($company: RawCompanyInput!) {
    importCompany(company: $company) {
      id
    }
  }
`;

export interface ImportCompanyMutationArgs {
  company: RawCompany;
}

export const removeCompany = gql`
  mutation removeCompany($companyId: ID!) {
    removeCompany(companyId: $companyId) {
      id
    }
  }
`;

export interface RemoveCompanyMutationArgs {
  companyId: string;
}

export const importFromPhone = gql`
  mutation importFromPhone($id: ID!) {
    importConfigFromPhone(id: $id) {
      id
    }
  }
`;

export interface ImportFromPhoneMutationArgs {
  id: string;
}

export const findPhones = gql`
  mutation findPhones($companyId: ID!) {
    findPhones(companyId: $companyId) {
      id
      name
      phones {
        id
        name
        number
        type
        mac
        status
        skipContacts
        topSoftkeys {
          id
          type
          label
          value
        }
        softkeys {
          id
          type
          label
          value
        }
      }
    }
  }
`;

export interface FindPhonesMutationArgs {
  companyId: string;
}
