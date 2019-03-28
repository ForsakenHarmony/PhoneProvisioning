import { Localizer, Text } from "./i18n";

import {
  addCompany as addCompanyMut,
  companies,
  exportCompany as exportCompanyMut,
  importCompany as importCompanyMut,
  removeCompany as removeCompanyMut,
  setActiveCompany as setActiveCompanyMut
} from "../gql/index.gql";
import { Company } from "./company";
import { Download, Trash, Upload } from "preact-feather";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useQuery, useMutation } from "@pql/boost";

function useFilePicker(cb) {
  // const [open, setOpen] = useState(() => {});
  return useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.onchange = () => {
      cb(input.files);
    };
    input.click();
    // setOpen(input.click.bind(input));
    input.remove();
  }, [cb]);
  // useEffect(() => {
  //   const input = document.createElement("input");
  //   input.setAttribute("type", "file");
  //   input.onchange = () => {
  //     cb(input.files);
  //   };
  //   setOpen(input.click.bind(input));
  //   return () => {
  //     input.remove();
  //   };
  // }, [cb]);
  // return open;
}

function download(base64, name) {
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    `data:application/json;charset=utf-8;base64,${base64}`
  );
  a.setAttribute("download", name);
  a.click();
}

export function Config() {
  const [selectedCompany, setSelectedCompany] = useState("");

  const [{ data, error, fetching }] = useQuery({ query: companies });
  console.log(data, error, fetching);

  const [{}, setActive] = useMutation(setActiveCompanyMut);
  const [{}, addC] = useMutation(addCompanyMut);
  const [{}, exportC] = useMutation(exportCompanyMut);
  const [{}, importC] = useMutation(importCompanyMut);
  const [{}, removeC] = useMutation(removeCompanyMut);

  const setSelected = useCallback(
    name => {
      if (name === selectedCompany) return;
      setSelectedCompany(selected => {
        if (name !== selected && name !== "" && name !== "new") {
          setActive({ id: name }).catch(e => {});
        }
        return name;
      });
    },
    [selectedCompany]
  );

  useEffect(() => {
    if (!fetching && data && selectedCompany === "") {
      setSelected((data.companies[0] || {}).id || "new");
    }
  }, [selectedCompany, data, fetching, data]);

  const createNew = useCallback(
    async name => {
      const { data } = await addC({ name });
      setSelected(data.company.id);
    },
    [selectedCompany]
  );

  const exportCompany = useCallback(async () => {
    if (selectedCompany === "new" || selectedCompany === "") return;
    const { data } = await exportC({
      companyId: selectedCompany
    });
    download(
      btoa(JSON.stringify(data.exportCompany, void 0, 2)),
      `export-phone.json`
    );
  }, [selectedCompany]);

  const importCompany = useFilePicker(async files => {
    console.log(files);
    try {
      const file = files[0];
      const text = await new Response(file).text();
      const company = JSON.parse(text);
      const { data } = await importC({ company });
      setSelected(data.importCompany.id);
    } catch (e) {
      alert(`Couldn't parse file \n${e.message}`);
    }
  });

  const removeCompany = useCallback(async () => {
    if (selectedCompany === "new" || selectedCompany === "") return;
    await removeC({ companyId: selectedCompany });
    setSelected((data.companies[0] || {}).id || "new");
  }, [selectedCompany, data]);

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
              onChange={e => setSelectedCompany(e.target.value)}
            >
              {!data ? (
                <option>
                  <Text id="loading" />
                </option>
              ) : (
                data.companies.map(c => <option value={c.id}>{c.name}</option>)
              )}
              <option value={"new"}>
                <Text id="new_company" />
              </option>
            </select>
            <Localizer>
              <button
                class="btn btn-primary btn-action tooltip tooltip-bottom"
                data-tooltip={<Text id="export" />}
                onClick={exportCompany}
              >
                <Download />
              </button>
            </Localizer>
            <Localizer>
              <button
                class="btn btn-primary btn-action tooltip tooltip-bottom"
                data-tooltip={<Text id="import" />}
                onClick={importCompany}
              >
                <Upload />
              </button>
            </Localizer>
            <Localizer>
              <button
                class="btn btn-primary btn-action tooltip tooltip-bottom"
                data-tooltip={<Text id="remove_company" />}
                onClick={removeCompany}
              >
                <Trash />
              </button>
            </Localizer>
          </section>
          <section class="navbar-section" />
        </header>
      </div>
      {fetching ? (
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
        <Company id={selectedCompany} addCompany={createNew} />
      )}
    </div>
  );
}
