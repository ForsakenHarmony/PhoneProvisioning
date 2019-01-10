import { Card, HTMLSelect, Navbar, Spinner } from "@blueprintjs/core";
import { Text } from "preact-i18n";
import { Component } from "preact";
import { connect, mutation, query } from "@pql/preact";

import { addCompany, companies } from "../gql/index.gql";
import { Company } from "./company";

class ConfigView extends Component {
  state = {
    selectedCompany: ""
  };

  createNew = async (name) => {
    const { data } = await this.props.addCompany({
      variables: {
        name: name
      }
    });
    this.setState({
      selectedCompany: data.addCompany.id
    });
  };

  render({ loaded, data, error, addCompany }, { selectedCompany, newName }, {}) {
    return (
      <div id="app">
        <Navbar>
          <Navbar.Group>
            <Navbar.Heading>
              <Text id="phone_provisioning"/>
            </Navbar.Heading>
            <Navbar.Divider/>
            <HTMLSelect
              value={selectedCompany}
              onChange={e => this.setState({ selectedCompany: e.target.value })}
            >
              {!data ? (
                <option>
                  <Text id="loading"/>
                </option>
              ) : (
                data.companies.map((c) => (
                  <option value={c.id}>{c.name}</option>
                ))
              )}
              <option value={""}>
                <Text id="new_company"/>
              </option>
            </HTMLSelect>
          </Navbar.Group>
        </Navbar>
        {!data ? (
          <div bp="margin flex">
            <div bp="fit">
              <Card>
                <Spinner/>
              </Card>
            </div>
          </div>
        ) : (
          <Company query={{ variables: { id: selectedCompany } }} addCompany={addCompany}/>
        )}
      </div>
    );
  }
}

export const Config = connect(ConfigView, {
  query: query(companies),
  mutation: {
    addCompany: mutation(addCompany)
  },
  refetch: true
});