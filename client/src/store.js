import { action, computed, observable, runInAction } from "mobx";

export class Store {
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
    return Array.from({ length: this.company.phones.length + 1 }, (_, i) =>
      i > this.draggedId ? i - 1 : i
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

export class Company {
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

export class Phone {
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

export class Softkey {
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

export class PhoneConfig {
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
