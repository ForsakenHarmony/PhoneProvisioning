import { Localizer, Text } from "preact-i18n";
import { Component } from "preact";
import { connect, mutation, query } from "@pql/preact";
import lst from "linkstate";

import { addCompany, companies, exportCompany, importCompany, removeCompany, setActiveCompany } from "../gql/index.gql";
import { Company } from "./company";
import { Download, Trash, Upload } from "preact-feather";

class ConfigView extends Component {
  state = {
    selectedCompany: ""
  };

  createNew = async name => {
    const { data } = await this.props.addCompany({
      variables: {
        name: name
      }
    });
    this.setState({
      selectedCompany: data.addCompany.id
    });
  };

  componentDidUpdate = (_, prevState) => {
    if (
      this.props.loaded &&
      this.props.data &&
      this.state.selectedCompany === ""
    ) {
      this.setState({
        selectedCompany: (this.props.data.companies[0] || {}).id || "new"
      });
    }
    if (
      prevState.selectedCompany !== this.state.selectedCompany &&
      this.state.selectedCompany !== "new" &&
      this.state.selectedCompany !== ""
    ) {
      this.props.setActive({
        variables: {
          id: this.state.selectedCompany
        }
      });
    }
  };

  exportCompany = async () => {
    if (this.state.selectedCompany === "new" ||
    this.state.selectedCompany === "" ) {
      return;
    }
    const { data } = await this.props.exportCompany({
      variables: {
        companyId: this.state.selectedCompany
      }
    });
    const a = document.createElement("a");
    a.setAttribute("href", `data:application/json;charset=utf-8;base64,${btoa(JSON.stringify(data.exportCompany, void 0, 2))}`);
    a.setAttribute("download", `export-phone.json`);
    a.click();
  };

  importCompany = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.click();
    input.onchange = async () => {
      console.log(input.files);
      try {
        const file = input.files[0];
        const text = await new Response(file).text();
        const company = JSON.parse(text);
        const { data } = await this.props.importCompany({
          variables: {
            company: company
          }
        });
        this.setState({
          selectedCompany: data.importCompany.id
        });
      } catch (e) {
        alert(`Couldn't parse file \n${e.message}`)
      }
    };
  };

  removeCompany = () => {
    if (this.state.selectedCompany === "new" ||
      this.state.selectedCompany === "" ) {
      return;
    }
    this.props.removeCompany({
      variables: {
        companyId: this.state.selectedCompany
      }
    }).then(() => {
      this.setState({
        selectedCompany: (this.props.data.companies[0] || {}).id || "new"
      });
    })
  };

  render({ loaded, data, error }, { selectedCompany, newName }, {}) {
    return (
      <div id="app">
        <div class="column">
          <header class="navbar">
            <section class="navbar-section">
              <a href="#" class="navbar-brand text-bold mr-2">
                <Text id="phone_provisioning" />
              </a>
            </section>
            <section class="navbar-section">
              <select
                class="form-select"
                value={selectedCompany}
                onChange={lst(this, "selectedCompany")}
              >
                {!data ? (
                  <option>
                    <Text id="loading" />
                  </option>
                ) : (
                  data.companies.map(c => (
                    <option value={c.id}>{c.name}</option>
                  ))
                )}
                <option value={"new"}>
                  <Text id="new_company" />
                </option>
              </select>
              <Localizer>
                <button
                  class="btn btn-primary btn-action tooltip tooltip-bottom"
                  data-tooltip={<Text id="export"/>}
                  onClick={this.exportCompany}>
                  <Download/>
                </button>
              </Localizer>
              <Localizer>
                <button
                  class="btn btn-primary btn-action tooltip tooltip-bottom"
                  data-tooltip={<Text id="import"/>}
                  onClick={this.importCompany}>
                  <Upload/>
                </button>
              </Localizer>
              <Localizer>
                <button
                  class="btn btn-primary btn-action tooltip tooltip-bottom"
                  data-tooltip={<Text id="delete"/>}
                  onClick={this.removeCompany}>
                  <Trash/>
                </button>
              </Localizer>
            </section>
            <section class="navbar-section"/>
          </header>
        </div>
        {!loaded ? (
          <div class="container">
            <div class="card">
              <div class="card-body">
                <div class="loading loading-lg" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div class="container">
            <div class="card">
              <div class="card-body">
                <Text id="error" />
                <p>{JSON.stringify(error)}</p>
              </div>
            </div>
          </div>
        ) : (
          <Company
            id={selectedCompany}
            addCompany={this.createNew}
          />
        )}
      </div>
    );
  }
}

export const Config = connect(
  ConfigView,
  {
    query: query(companies),
    mutation: {
      addCompany: mutation(addCompany),
      setActive: mutation(setActiveCompany),
      exportCompany: mutation(exportCompany),
      importCompany: mutation(importCompany),
      removeCompany: mutation(removeCompany),
    },
    refetch: true
  }
);
