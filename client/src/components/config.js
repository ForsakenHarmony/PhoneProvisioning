import {
  Button,
  Card,
  Divider,
  FormGroup,
  H5,
  HTMLSelect,
  InputGroup,
  Navbar,
  NonIdealState,
  Spinner
} from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";

export default class Config {
  render() {
    return (
      <div id="app">
        <Navbar>
          <Navbar.Group>
            <Navbar.Heading>
              <Text id="phone_provisioning" />
            </Navbar.Heading>
            <Navbar.Divider />
            <HTMLSelect
              value={this.store.selectedCompany}
              onChange={e => this.store.select(parseInt(e.target.value, 10))}
            >
              {this.store.loading ? (
                <option>
                  <Text id="loading" />
                </option>
              ) : (
                this.store.companies.map((c, i) => (
                  <option value={i}>{c.name}</option>
                ))
              )}
              <option value={-1}>
                <Text id="new_company" />
              </option>
            </HTMLSelect>
          </Navbar.Group>
        </Navbar>
        <div bp="margin flex">
          <div bp="fit">
            {this.store.loading ? (
              <Card>
                <Spinner />
              </Card>
            ) : this.store.company == null ? (
              <Card>
                <H5>
                  <Text id="new_company" />
                </H5>
                <Divider />
                <Localizer>
                  <FormGroup label={<Text id="name" />}>
                    <Localizer>
                      <InputGroup
                        value={this.store.newName}
                        onChange={this.store.setNew}
                        placeholder={<Text id="name" />}
                      />
                    </Localizer>
                  </FormGroup>
                </Localizer>
                <Button onClick={this.store.createNew}>
                  <Text id="create_company" />
                </Button>
              </Card>
            ) : (
              <CompanyPhoneView
                company={this.store.company}
                store={this.store}
              />
            )}
          </div>
          <div
            bp="fill margin-left flex"
            style="overflow-x: auto; flex-wrap: nowrap"
          >
            {this.store.company ? (
              this.store.company.phones.map((p, id) => (
                <div bp="margin 6">
                  <PhoneConfigView
                    phone={p}
                    id={id}
                    company={this.store.company}
                  />
                </div>
              ))
            ) : (
              <Localizer>
                <NonIdealState icon="phone" title={<Text id="no_phones" />} />
              </Localizer>
            )}
          </div>
        </div>
      </div>
    );
  }
}