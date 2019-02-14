import { Localizer, Text } from "preact-i18n";
import { Copy, Plus, Save } from "preact-feather";
import clsx from "clsx";
import { Component } from "preact";
import { connect, mutation } from "@pql/preact";
import {
  addSoftkey,
  addTopSoftkey,
  copyToAll,
  removeSoftkey,
  removeTopSoftkey,
  transferConfig,
  updateSoftkey,
  updateTopSoftkey
} from "../gql/index.gql";
import {
  SoftkeyConfig,
  SoftkeyPopover,
  TopSoftkeyPopover
} from "./softkey-config";

class PhoneConfigView extends Component {
  state = {
    activeView: "top_softkeys",
    settingSoftkey: false,
    copying: false,
    transferring: false
  };

  changeViewTo(view, e) {
    e.preventDefault();
    this.setState({
      activeView: view
    });
  }

  addTopSoftkey = softkey => {
    this.setState({ settingSoftkey: true });
    this.props
      .addTopSoftkey({
        variables: {
          phoneId: this.props.phone.id,
          softkey
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  removeTopSoftkey = id => {
    this.setState({ settingSoftkey: true });
    this.props
      .removeTopSoftkey({
        variables: {
          id
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  updateTopSoftkey = (id, softkey) => {
    this.setState({ settingSoftkey: true });
    this.props
      .updateTopSoftkey({
        variables: {
          id,
          softkey
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  addSoftkey = softkey => {
    this.setState({ settingSoftkey: true });
    this.props
      .addSoftkey({
        variables: {
          phoneId: this.props.phone.id,
          softkey
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  removeSoftkey = id => {
    this.setState({ settingSoftkey: true });
    this.props
      .removeSoftkey({
        variables: {
          id
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  updateSoftkey = (id, softkey) => {
    this.setState({ settingSoftkey: true });
    this.props
      .updateSoftkey({
        variables: {
          id,
          softkey
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ settingSoftkey: false }));
  };

  copyToAll = () => {
    this.setState({ copying: true });
    this.props
      .copyToAll({
        variables: {
          phoneId: this.props.phone.id
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ copying: false }));
  };

  transferConfig = () => {
    this.setState({ transferring: true });
    this.props
      .transferConfig({
        variables: {
          phoneId: this.props.phone.id
        }
      })
      .then(this.clearError)
      .catch(this.setError)
      .then(() => this.setState({ transferring: false }));
  };

  clearError = () => {
    this.setState({ error: null });
  };

  setError = error => {
    this.setState({ error });
  };

  render({ phone }, { activeView, transferring, copying, settingSoftkey }, {}) {
    return (
      <div class="card card-softkey panel">
        <div class="panel-header text-center">
          <div class="panel-title h5 mt-10">{phone.name}</div>
          <div class="panel-subtitle">{phone.number}</div>
        </div>
        <nav class="panel-nav">
          <ul class="tab tab-block">
            <li
              class={clsx({
                "tab-item": true,
                active: activeView === "top_softkeys"
              })}
            >
              <a
                href="#!"
                class="badge"
                data-badge={phone.topSoftkeys.length}
                onClick={this.changeViewTo.bind(this, "top_softkeys")}
              >
                <Text id="top_softkeys" />
              </a>
            </li>
            <li
              class={clsx({
                "tab-item": true,
                active: activeView === "softkeys"
              })}
            >
              <a
                href="#!"
                class="badge"
                data-badge={phone.softkeys.length}
                onClick={this.changeViewTo.bind(this, "softkeys")}
              >
                <Text id="softkeys" />
              </a>
            </li>
          </ul>
        </nav>
        <div class="panel-body">
          {activeView === "top_softkeys"
            ? phone.topSoftkeys.map(softkey => (
                <SoftkeyConfig
                  softkey={softkey}
                  set={this.updateTopSoftkey.bind(null, softkey.id)}
                  remove={this.removeTopSoftkey}
                  isTop={true}
                  loading={settingSoftkey}
                />
              ))
            : phone.softkeys.map(softkey => (
                <SoftkeyConfig
                  softkey={softkey}
                  set={this.updateSoftkey.bind(null, softkey.id)}
                  remove={this.removeSoftkey}
                  loading={settingSoftkey}
                />
              ))}
        </div>
        <div class="panel-footer">
          <div class="btn-group btn-group-block popover popover-with-trigger">
            <Localizer>
              <button
                type="button"
                class={clsx("btn btn-primary btn-action tooltip", {
                  "loading": transferring
                })}
                data-tooltip={<Text id="transfer_config" />}
                onClick={this.transferConfig}
              >
                <Save />
              </button>
            </Localizer>
            <button
              type="button"
              class="btn btn-primary btn-action popover-trigger"
            >
              <Plus />
            </button>
            {activeView === "top_softkeys" ? (
              <TopSoftkeyPopover
                softkey={{ type: "None", id: "new" }}
                isNew={true}
                set={this.addTopSoftkey}
                loading={settingSoftkey}
              />
            ) : (
              <SoftkeyPopover
                softkey={{ type: "None", id: "new" }}
                isNew={true}
                set={this.addSoftkey}
                loading={settingSoftkey}
              />
            )}
            <Localizer>
              <button
                type="button"
                class={clsx("btn btn-primary btn-action tooltip", {
                  "loading": copying
                })}
                data-tooltip={<Text id="copy_to_all" />}
                onClick={this.copyToAll}
              >
                <Copy />
              </button>
            </Localizer>
          </div>
        </div>
      </div>
    );
  }
}

export const PhoneConfig = connect(
  PhoneConfigView,
  {
    mutation: {
      addTopSoftkey: mutation(addTopSoftkey),
      updateTopSoftkey: mutation(updateTopSoftkey),
      removeTopSoftkey: mutation(removeTopSoftkey),
      addSoftkey: mutation(addSoftkey),
      updateSoftkey: mutation(updateSoftkey),
      removeSoftkey: mutation(removeSoftkey),
      copyToAll: mutation(copyToAll),
      transferConfig: mutation(transferConfig)
    }
  }
);
