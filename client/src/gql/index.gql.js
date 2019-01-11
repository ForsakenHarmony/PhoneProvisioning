import { gql } from "@pql/client";

export const companies = gql`
  query companies {
    companies {
      id
      name
      phones {
        id
        name
        number
        ip
        status
        topSoftkeys {
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
        ip
        status
        topSoftkeys {
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

export const addPhone = gql`
  mutation addPhone($companyId: String!, $phone: PhoneInput!) {
    addPhone(companyId: $companyId, phone: $phone) {
      id
      name
      number
      ip
      status
      topSoftkeys {
        id
        type
        label
        value
      }
    }
  }
`;

export const removePhone = gql`
  mutation removePhone($id: ID!) {
    removePhone(phoneId: $id) {
      id
    }
  }
`;

export const updatePhone = gql`
  mutation addCompany($name: String!) {
    addCompany(company: { name: $name }) {
      id
    }
  }
`;

export const phoneStatus = gql`
  subscription phoneStatus {
    phoneStatus {
      phone {
        id
        name
        number
        ip
        status
        topSoftkeys {
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
