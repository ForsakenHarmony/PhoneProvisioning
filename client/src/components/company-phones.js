import { Button, Card, Divider, FormGroup, H5, HTMLTable, NumericInput } from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";
import { connect, mutation } from "@pql/preact";
import { DnD } from "./dnd";
import { PhoneView } from "./phone-view";
import { Component } from "react";
import { addPhone, removePhone } from "../gql/index.gql";

class CompanyPhoneView extends Component {
  state = {
    newName: ""
  };

  removePhone = (id) => {

  };

  render({ company }) {
    return (
      <Card elevation={3}>
        <H5>
          <Text id="phones"/>
        </H5>
        <Divider/>
        <HTMLTable striped bordered style="position: relative">
          <thead>
            <tr>
              <th/>
              <th>
                <Text id="name"/>
              </th>
              <th>
                <Text id="number"/>
              </th>
              <th>
                <Text id="ip"/>
              </th>
              <th/>
            </tr>
          </thead>
          <DnD
            container={({ children, ...props }) => (
              <tbody {...props}>
                {children}
                <PhoneView
                  id={company.phones.length}
                  focus={company.addPhone}
                  last={true}
                />
              </tbody>
            )}
            item={({ data, ...props }) => (
              <PhoneView
                phone={data}
                id={data.id}
                remove={this.removePhone}
                {...props}
              />
            )}
            items={company.phones}
          />
        </HTMLTable>
        <Divider/>
        <Localizer>
          <FormGroup label={<Text id="leave_free"/>}>
            <NumericInput
              value={company.offset}
              onValueChange={company.setOffset}
            />
          </FormGroup>
        </Localizer>
        <Button onClick={company.set}>
          <Text id="transfer_config"/>
        </Button>
      </Card>
    );
  }
}

export const CompanyPhones = connect(CompanyPhoneView, {
  mutation: {
    addPhone: mutation(addPhone),
    removePhone: mutation(removePhone),
  },
  refetch: false
});
