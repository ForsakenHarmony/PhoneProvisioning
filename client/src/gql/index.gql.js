import { gql } from '@pql/client';

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
  mutation addPhone($name: String!) {
    addCompany(company: { name: $name }) {
      id
    }
  }
`;

export const removePhone = gql`
  mutation addCompany($name: String!) {
    addCompany(company: { name: $name }) {
      id
    }
  }
`;

export const phoneStatus = gql`
  subscription phoneStatus {
    phoneStatus {
      id,
      status,
      date
    }
  }
`;
