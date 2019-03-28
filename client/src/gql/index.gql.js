import { gql } from "@pql/macro";

export const companies = gql`
  query companies {
    companies {
      id
      name
      phones {
        id
        name
        number
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

export const company = gql`
  query company($id: ID!) {
    company(companyId: $id) {
      id
      name
      phones {
        id
        name
        number
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

export const addCompany = gql`
  mutation addCompany($name: String!) {
    addCompany(company: { name: $name }) {
      id
    }
  }
`;

export const setActiveCompany = gql`
  mutation setActiveCompany($id: ID!) {
    setActiveCompany(companyId: $id)
  }
`;

export const addPhone = gql`
  mutation addPhone($companyId: ID!, $phone: PhoneInput!) {
    addPhone(companyId: $companyId, phone: $phone) {
      id
      name
      number
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

export const removePhone = gql`
  mutation removePhone($id: ID!) {
    removePhone(id: $id) {
      id
    }
  }
`;

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

export const removeTopSoftkey = gql`
  mutation removeTopSoftkey($id: ID!) {
    removeTopSoftkey(id: $id) {
      id
    }
  }
`;

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

export const removeSoftkey = gql`
  mutation removeSoftkey($id: ID!) {
    removeSoftkey(id: $id) {
      id
    }
  }
`;

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

export const transferConfig = gql`
  mutation transferConfig($phoneId: ID!) {
    transferConfigToPhone(phoneId: $phoneId)
  }
`;

export const transferConfigToAll = gql`
  mutation transferConfig($companyId: ID!) {
    transferConfigToPhones(companyId: $companyId)
  }
`;

export const phoneStatus = gql`
  subscription phoneStatus {
    phoneStatus {
      phone {
        id
        name
        number
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

export const exportCompany = gql`
  mutation exportCompany($companyId: ID!) {
    exportCompany(companyId: $companyId) {
      name
      phones {
        name
        number
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

export const importCompany = gql`
  mutation importCompany($company: RawCompanyInput!) {
    importCompany(company: $company) {
      id
    }
  }
`;

export const removeCompany = gql`
  mutation removeCompany($companyId: ID!) {
    removeCompany(companyId: $companyId) {
      id
    }
  }
`;

export const importFromPhone = gql`
  mutation importFromPhone($id: ID!) {
    importConfigFromPhone(id: $id) {
      id
    }
  }
`;
