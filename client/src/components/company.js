import { query, subscription, withSubscription } from "@pql/preact";
import { company, phoneStatus } from "../gql/index.gql";
import {
  Button,
  Card,
  Divider,
  FormGroup,
  H5,
  InputGroup,
  NonIdealState,
  Spinner
} from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";
import lst from "linkstate";
import { PhoneConfig } from "./phone-config-view";
import { CompanyPhones } from "./company-phones";
import { Component } from "preact";

class CompanyView extends Component {
  state = {
    newName: ""
  };

  render({ loaded, data, error }, { newName }, {}) {
    return (
      <div bp="margin flex">
        <div bp="fit">
          {!loaded ? (
            <div class="card">
              <div class="loading loading-lg"/>
            </div>
          ) : !data || !data.company ? (
            <div class="card">
              <div class="card-header">
                <div class="card-title h5">
                  <Text id="new_company" />
                </div>
              </div>
              <div class="card-body">
                <Localizer>
                  <FormGroup label={<Text id="name" />}>
                    <Localizer>
                      <InputGroup
                        value={newName}
                        onChange={lst(this, "newName")}
                        placeholder={<Text id="name" />}
                      />
                    </Localizer>
                  </FormGroup>
                </Localizer>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary" onClick={this.createNew}>
                  <Text id="create_company" />
                </button>
              </div>
            </div>
          ) : (
            <CompanyPhones company={data.company} />
          )}
        </div>
        <div
          bp="fill margin-left flex"
          style="overflow-x: auto; flex-wrap: nowrap"
        >
          {data && data.company ? (
            data.company.phones.map((p, id) => (
              <div bp="margin 6">
                <PhoneConfig phone={p} id={id} company={data.company} />
              </div>
            ))
          ) : (
            <Localizer>
              <NonIdealState icon="phone" title={<Text id="no_phones" />} />
            </Localizer>
          )}
        </div>
      </div>
    );
  }
}

export const Company = withSubscription(CompanyView, {
  query: query(company),
  subscription: subscription(phoneStatus),
  processUpdate: (data, next) => {
    console.log(data, next);
    if (!data || next.company) return next;
    data.company.phones[next.phone.id] = next.phone;
    return data;
  }
});
