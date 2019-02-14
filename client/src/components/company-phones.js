import { Text } from "preact-i18n";
import { connect, mutation } from "@pql/preact";
import { DnD } from "./dnd";
import { PhoneView } from "./phone-view";
import { Component } from "react";
import {
  addPhone,
  removePhone,
  movePhones,
  transferConfigToAll,
  updatePhone
} from "../gql/index.gql";
import clsx from "clsx";

class CompanyPhoneView extends Component {
  state = {
    name: null,
    mac: null,
    number: null
  };

  removePhone = id => {
    console.log("remove", id);
    this.props
      .removePhone({
        variables: {
          id
        }
      })
      .then(this.clearError)
      .catch(this.setError);
  };

  updatePhone = (id, field, e) => {
    console.log("update", id, field, e);
    const phone = this.props.company.phones.find(p => p.id === id);
    phone[field] = e.target.value;
    if (!phone) return;
    this.props
      .updatePhone({
        variables: {
          id,
          phone: {
            name: phone.name,
            number: phone.number,
            mac: phone.mac
          }
        }
      })
      .then(this.clearError)
      .catch(this.setError);
  };

  addPhone = (field, e) => {
    console.log("add", field, e);
    this.setState({ [field]: e.target.value }, () => {
      if (!e.target.validity.valid) return;
      if (this.state.name && this.state.number) {
        this.props
          .addPhone({
            variables: {
              companyId: this.props.company.id,
              phone: {
                name: this.state.name,
                number: this.state.number,
                mac: this.state.mac
              }
            }
          })
          .then(() => {
            this.setState({
              name: null,
              mac: null,
              number: null
            });
          })
          .then(this.clearError)
          .catch(this.setError);
      }
    });
  };

  submitPhone = (id, e) => {
    console.log("submit", id, e);
  };

  move = (from, to) => {
    this.props
      .swapPhones({
        variables: {
          from,
          to
        }
      })
      .then(this.clearError)
      .catch(this.setError);
  };

  transferConfig = () => {
    this.props
      .transferConfig({
        variables: {
          companyId: this.props.company.id
        }
      })
      .then(this.clearError)
      .catch(this.setError);
  };

  clearError = () => {
    this.setState({ error: null });
  };

  setError = error => {
    this.setState({ error });
  };

  render({ company, loading }, { error }) {
    return (
      <div class="card card-phones">
        <div class="card-header">
          <div class="card-title h5">
            <Text id="phones" />
            {error && <div class="bg-error">{JSON.stringify(error)}</div>}
          </div>
        </div>
        <div class="card-body">
          {company.phones.map(phone => (
            <form
              id={phone.id}
              onSubmit={this.submitPhone.bind(null, phone.id)}
            >
              <button style={{ display: "none" }} />
            </form>
          ))}
          <form id="new" onSubmit={this.submitPhone.bind(null, "new")}>
            <button style={{ display: "none" }} />
          </form>
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
                  <Text id="mac" />
                </th>
                <th>
                  <Text id="status" />
                </th>
                <th />
              </tr>
            </thead>
            <DnD
              handle={({ ...props }) => (
                <button class={clsx("btn btn-action", { loading })} type="button" {...props}>
                  <i class="icon icon-resize-vert" />
                </button>
              )}
              container={({ children, ...props }) => (
                <tbody {...props}>
                  {children}
                  <PhoneView
                    id="new"
                    phone={this.state}
                    update={this.addPhone}
                    last={true}
                  />
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
              onMove={this.move}
            />
          </table>
        </div>

        <div class="card-footer">
          <button
            class={clsx("btn btn-primary", { "loading": loading })}
            onClick={this.transferConfig}
          >
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
      removePhone: mutation(removePhone),
      swapPhones: mutation(movePhones),
      transferConfig: mutation(transferConfigToAll)
    }
  }
);
