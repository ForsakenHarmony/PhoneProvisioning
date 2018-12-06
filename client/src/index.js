import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "blueprint-css/dist/blueprint.css";
import { Component } from "preact";
import { observer } from "mobx-react";
import { action, autorun, computed, observable, runInAction } from "mobx";
import {
  Button,
  Card,
  ControlGroup,
  Divider,
  FocusStyleManager,
  FormGroup,
  H5,
  HTMLSelect,
  HTMLTable,
  InputGroup,
  Navbar,
  NonIdealState,
  NumericInput,
  Spinner
} from "@blueprintjs/core";
import { IntlProvider, Localizer, Text } from "preact-i18n";

FocusStyleManager.onlyShowFocusOnTabs();

const definition = {
  leave_free: "Tastenfelder frei lassen",
  phones: "Telefone",
  phone_provisioning: "Telefon Config",
  transfer_config: "Konfig Übertragen",
  loading: "Wird geladen ...",
  new_phone: "Neu",
  new_company: "Neuer Kunde",
  name: "Name",
  number: "Nummer",
  ip: "IP",
  label: "Beschrift.",
  value: "Wert",
  copy: "Kopieren",
  save: "Konfig übertragen",
  no_phones: "Keine Telefone",
  create_company: "Erstellen",
  softkey: {
    "": "Kein",
    line: "Leitung",
    speeddial: "Direktwahl",
    dnd: "Bitte nicht stören",
    blfprivacy: "BLF Privacy",
    blf: "BLF",
    list: "BLF/Liste",
    acd: "Automatische Anrufverteilung",
    dcp: "Direkt Abnehmen",
    xml: "XML",
    flash: "Flash",
    spre: "Sprecode",
    park: "Parken",
    pickup: "Abnehmen",
    lcr: "Letzter Rückruf",
    callforward: "RufUml.f",
    blfxfer: "BLF/Weiterltg.",
    speeddialxfer: "Direktwahl/Weiterltg.",
    speeddialconf: "Direktwahl/Konf.",
    directory: "Telefonbuch",
    filter: "Filter",
    callers: "Anrufliste",
    redial: "Wahlw.",
    conf: "Konf.",
    xfer: "Weiterl.",
    icom: "Gegenspr.",
    phonelock: "Telefonsperre",
    paging: "Paging",
    hotdesklogin: "Log-In",
    speeddialmwi: "Direktwahl/MWI",
    discreetringing: "Discreet Ringing",
    empty: "Leer"
  }
};

const softkey_types = [
  "",
  "line",
  "speeddial",
  "dnd",
  "blfprivacy",
  "blf",
  "list",
  "acd",
  "dcp",
  "xml",
  "flash",
  "spre",
  "park",
  "pickup",
  "lcr",
  "callforward",
  "blfxfer",
  "speeddialxfer",
  "speeddialconf",
  "directory",
  "filter",
  "callers",
  "redial",
  "conf",
  "xfer",
  "icom",
  "phonelock",
  "paging",
  "hotdesklogin",
  "speeddialmwi",
  "discreetringing",
  "empty"
];

class Store {
  @observable
  companies = [];
  @observable
  loading = true;
  @observable
  selectedCompany = 0;
  @observable
  dragging = false;
  @observable
  draggedId = 0;
  @observable
  newName = "";

  constructor() {
    this.fetchCompanies();
  }

  @action.bound
  setNew(e) {
    this.newName = e.target.value;
  }

  @action.bound
  async createNew() {
    if (!this.newName) return;
    this.loading = true;
    const { id } = await fetch(`/api/company`, {
      method: "POST",
      body: JSON.stringify({
        name: this.newName
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }).then(r => r.json());
    runInAction(() => {
      this.selectedCompany = id;
      this.fetchCompanies();
    });
  }

  @action.bound
  select(id) {
    this.selectedCompany = id;
  }

  @computed
  get company() {
    return this.companies[this.selectedCompany];
  }

  @action.bound
  startDrag(id) {
    this.dragging = true;
    this.draggedId = id;
  }

  @action.bound
  stopDrag() {
    this.dragging = false;
  }

  @action.bound
  completeDrag(target) {
    this.company.move(this.draggedId, target);
  }

  @computed
  get dragTargets() {
    return Array.from(
      { length: this.company.phones.length + 1 },
      (_, i) => (i > this.draggedId ? i - 1 : i)
    );
  }

  @action.bound
  async fetchCompanies() {
    const { companies } = await fetch(`/api/company`).then(r => r.json());
    runInAction(() => {
      this.companies = companies.map((c, id) => new Company({ id, ...c }));
      this.selectedCompany = companies[this.selectedCompany]
        ? this.selectedCompany
        : -1;
      this.loading = false;
    });
  }
}

class Company {
  @observable
  phones = [];
  @observable
  id;
  @observable
  offset = 0;
  @observable
  name = "";

  @action.bound
  removePhone(id) {
    this.phones.splice(id, 1);
  }

  @action.bound
  addPhone() {
    this.phones.push(new Phone({ offset: this.offset }));
  }

  @action.bound
  setOffset(number) {
    this.offset = number;
    this.phones.map(p => p.config.setOffset(number));
  }

  @action.bound
  move(from, to) {
    console.log("move", from, to);
    if (from === to) return;
    const [phone] = this.phones.splice(from, 1);
    this.phones.splice(to, 0, phone);
  }

  @action.bound
  copyConfig(from) {
    const config = this.phones[from].config;
    this.phones.map(p => {
      p.config = new PhoneConfig({ ...config, offset: this.offset });
    });
  }

  constructor(company) {
    Object.assign(this, {
      ...company,
      phones: company.phones.map(
        p => new Phone({ ...p, offset: company.offset })
      )
    });
  }

  @action.bound
  set() {
    fetch(`/api/company/${this.id}`, {
      method: "PUT",
      body: JSON.stringify(this),
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}

class Phone {
  @observable
  name = "";
  @observable
  number = "";
  @observable
  ip = "";
  @observable
  config;

  constructor({
    name = "",
    number = "",
    ip = "",
    config = {},
    offset = 0
  } = {}) {
    this.name = name;
    this.number = number;
    this.ip = ip;
    this.config = new PhoneConfig({ ...config, offset });
  }

  @computed
  get empty() {
    return this.name === "" && this.number === "" && this.ip === "";
  }

  set = prop => e =>
    runInAction(() => {
      this[prop] = e.target.value;
    });
}

class Softkey {
  @observable
  type = "";
  @observable
  label = "";
  @observable
  value = "";

  constructor(key = {}) {
    Object.assign(this, key);
  }
}

class PhoneConfig {
  @observable
  topsoftkeys = [];

  constructor({ offset, topsoftkeys = [] } = {}) {
    this.topsoftkeys = topsoftkeys.map(key => new Softkey(key));
    this.setOffset(offset);
  }

  @action.bound
  setOffset(number) {
    const diff = number - this.topsoftkeys.length;
    if (diff > 0) {
      this.topsoftkeys.push(
        ...Array.from(
          { length: number - this.topsoftkeys.length },
          () => new Softkey()
        )
      );
    } else if (diff < 0) {
      this.topsoftkeys.splice(diff);
    }
  }

  @action.bound
  setSoftkey(
    id,
    name,
    {
      target: { value }
    }
  ) {
    this.topsoftkeys[id][name] = value;
  }
}

@observer
class PhoneView extends Component {
  state = {
    draggable: false
  };

  toggleDraggable(draggable) {
    window.getSelection().removeAllRanges();
    this.setState({ draggable });
  }

  dragStart = e => {
    e.dataTransfer.effectAllowed = "move";
    this.props.startDrag(this.props.id);
  };

  dragEnd = e => {
    this.props.stopDrag();
  };

  render() {
    const {
      phone = {},
      id,
      remove,
      last = false,
      focus = () => {},
      dragged
    } = this.props;
    const { draggable } = this.state;
    return (
      <tr
        key={id}
        id={`phone.${id}`}
        draggable={draggable}
        onDragStart={this.dragStart}
        onDragEnd={this.dragEnd}
        style={dragged ? "opacity: .5" : ""}
      >
        <td>
          {!last && (
            <Button
              icon="menu"
              minimal={true}
              onMouseEnter={this.toggleDraggable.bind(this, true)}
              onMouseLeave={this.toggleDraggable.bind(this, false)}
            />
          )}
        </td>
        <td>
          <InputGroup
            value={phone.name}
            onChange={phone.set && phone.set("name")}
            id={`phone.name.${id}`}
            onFocus={focus}
            placeholder="Name"
          />
        </td>
        <td>
          <InputGroup
            value={phone.number}
            onChange={phone.set && phone.set("number")}
            id={`phone.number.${id}`}
            onFocus={focus}
            placeholder="42"
          />
        </td>
        <td>
          <InputGroup
            value={phone.ip}
            onChange={phone.set && phone.set("ip")}
            id={`phone.ip.${id}`}
            onFocus={focus}
            placeholder="192.168.X.X"
          />
        </td>
        <td>
          {!last && <Button icon="cross" onClick={remove.bind(null, id)} />}
        </td>
      </tr>
    );
  }
}

class DragTarget extends Component {
  state = {
    over: false
  };

  dragOver = e => {
    e.preventDefault();
  };
  dragEnter = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    this.setState({ over: true });
  };
  dragLeave = e => {
    this.setState({ over: false });
  };
  drop = e => {
    e.preventDefault();
    this.props.drop(this.props.target);
  };

  render() {
    const { i, top = false } = this.props;
    const { over } = this.state;
    return (
      <div
        style={{
          position: "absolute",
          top: `${14 + i * 26}px`,
          height: "26px",
          width: "680px",
          [`border-${top ? "top" : "bottom"}`]: `1px solid ${
            over ? "red" : "transparent"
          }`
        }}
        onDragOver={this.dragOver}
        onDragEnter={this.dragEnter}
        onDragLeave={this.dragLeave}
        onDrop={this.drop}
      />
    );
  }
}

const CompanyPhoneView = observer(({ company, store }) => (
  <Card elevation={3}>
    <H5>
      <Text id="phones" />
    </H5>
    <Divider />
    <HTMLTable striped bordered style="position: relative">
      {store.dragging &&
        store.dragTargets.map((target, i) => [
          <DragTarget target={target} i={2 * i} drop={store.completeDrag} />,
          <DragTarget
            target={target}
            i={2 * i + 1}
            drop={store.completeDrag}
            top
          />
        ])}
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
          <th />
        </tr>
      </thead>
      <tbody>
        {company.phones.map((phone, id) => (
          <PhoneView
            phone={phone}
            id={id}
            remove={company.removePhone}
            dragged={store.dragging && store.draggedId === id}
            startDrag={store.startDrag}
            stopDrag={store.stopDrag}
          />
        ))}
        <PhoneView
          id={company.phones.length}
          focus={company.addPhone}
          last={true}
        />
      </tbody>
    </HTMLTable>
    <Divider />
    <Localizer>
      <FormGroup label={<Text id="leave_free" />}>
        <NumericInput
          value={company.offset}
          onValueChange={company.setOffset}
        />
      </FormGroup>
    </Localizer>
    <Button onClick={company.set}>
      <Text id="transfer_config" />
    </Button>
  </Card>
));

const TopSoftkeyConfig = observer(({ softkey, set }) => {
  return (
    <ControlGroup vertical={true}>
      <HTMLSelect value={softkey.type} onChange={set.bind(null, "type")}>
        {softkey_types.map(type => (
          <option value={type}>
            <Text id={`softkey.${type}`} />
          </option>
        ))}
      </HTMLSelect>
      <Localizer>
        <InputGroup
          value={softkey.label}
          onChange={set.bind(null, "label")}
          disabled={isLabelDisabled(softkey.type)}
          placeholder={<Text id="label" />}
        />
      </Localizer>
      <Localizer>
        <InputGroup
          value={softkey.value}
          onChange={set.bind(null, "value")}
          disabled={isValueDisabled(softkey.type)}
          placeholder={<Text id="value" />}
        />
      </Localizer>
    </ControlGroup>
  );
});

const PhoneConfigView = observer(({ phone, company, id }) => (
  <Card elevation={3}>
    <H5>
      {phone.name} ({phone.number})
      <Button icon="duplicate" onClick={company.copyConfig.bind(null, id)}>
        <Text id="copy" />
      </Button>
    </H5>
    <Divider />
    {phone.config.topsoftkeys.map((_, id) => (
      <TopSoftkeyConfig
        softkey={phone.config.topsoftkeys[id]}
        set={phone.config.setSoftkey.bind(null, id)}
      />
    ))}
  </Card>
));

@observer
export default class App extends Component {
  @observable
  store = new Store();

  render() {
    return (
      <IntlProvider definition={definition}>
        <Config/>
      </IntlProvider>
    );
  }
}

