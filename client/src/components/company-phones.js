import {
  Button,
  Card,
  Divider,
  FormGroup,
  H5,
  HTMLTable,
  NumericInput
} from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";
import { connect, mutation } from "@pql/preact";
import { DnD } from "./dnd";
import { PhoneView } from "./phone-view";
import { Component } from "react";
import { addPhone, removePhone, updatePhone } from "../gql/index.gql";
import lst from "linkstate";

class CompanyPhoneView extends Component {
  state = {
    newName: ""
  };

  removePhone = id => {};

  updatePhone = (id, field, e) => {};

  addPhone = (field, e) => {};

  render({ company }) {
    return (
      <div class="card">
        <div class="card-header">
          <div class="card-title h5">
            <Text id="phones" />
          </div>
        </div>
        <div class="card-body">
          <table class="table" style="position: relative">
            <thead>
              <tr>
                <th />
                <th>
                  <Text id="name" />
                </th>
                <th>
                  <Text id="number" />
                </th>
                <th>
                  <Text id="ip" />
                </th>
                <th>
                  <Text id="status" />
                </th>
                <th />
              </tr>
            </thead>
            <DnD
              handle={({ ...props }) => (
                <button class="btn btn-action" {...props}>
                  <i class="icon icon-resize-vert" />
                </button>
              )}
              container={({ children, ...props }) => (
                <tbody {...props}>
                  {children}
                  <PhoneView id="new" update={this.addPhone} last={true} />
                </tbody>
              )}
              item={({ data, ...props }) => (
                <PhoneView
                  phone={data}
                  id={data.id}
                  remove={this.removePhone.bind(null, data.id)}
                  update={this.updatePhone.bind(null, data.id)}
                  {...props}
                />
              )}
              items={company.phones}
            />
          </table>
        </div>

        <div class="card-footer">
          <button class="btn btn-primary" onClick={company.set}>
            <Text id="transfer_config" />
          </button>
        </div>
      </div>
    );
  }
}

export const CompanyPhones = connect(
  CompanyPhoneView,
  {
    mutation: {
      addPhone: mutation(addPhone),
      updatePhone: mutation(updatePhone),
      removePhone: mutation(removePhone)
    }
  }
);
