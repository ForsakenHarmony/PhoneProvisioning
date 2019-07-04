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

function removeTypename(thing) {
  if (Array.isArray(thing))
    return thing.map(removeTypename);

  if (typeof thing !== 'object')
    return thing;

  const { __typename, ...rest } = thing;
  const keys = Object.keys(rest);

  for (let i = 0; i < keys.length; i++) {
    const prop = keys[i];
    const value = rest[prop];
    rest[prop] = removeTypename(value);
  }

  return rest;
}

export function Config() {
  const [selectedCompany, setSelectedCompany] = useState("");

  const [{ data, error, fetching }, refetch] = useQuery({ query: companies });

  const [{}, setActive] = useMutation(setActiveCompanyMut);
  const [{}, addC] = useMutation(addCompanyMut);
  const [{}, exportC] = useMutation(exportCompanyMut);
  const [{}, importC] = useMutation(importCompanyMut);
  const [{}, removeC] = useMutation(removeCompanyMut);

  const setSelected = useCallback(
    id => {
      if (id === selectedCompany) return;
      setSelectedCompany(selected => {
        if (![selected, "", "new"].includes(id)) {
          setActive({ id: id }).catch(e => {});
        }
        return id;
      });
    },
    [selectedCompany]
  );

  useEffect(() => {
    if (!fetching && data && (selectedCompany === "" || selectedCompany !== "new" && !data.companies.find(c => c.id === selectedCompany))) {
      setSelected((data.companies[0] || {}).id || "new");
    }
  }, [selectedCompany, data, fetching, data]);

  const createNew = useCallback(
    async name => {
      const { data: { addCompany } } = await addC({ name });

      setSelected(addCompany.id);
      refetch({ skipCache: true });
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
      `export-phone-${data.exportCompany.name.toLowerCase().replace(/\s/g, '-')}.json`
    );
  }, [selectedCompany]);

  const importCompany = useFilePicker(async files => {
    console.log(files);
    try {
      const file = files[0];
      const text = await new Response(file).text();
      const company = removeTypename(JSON.parse(text));
      const { data } = await importC({ company });
      setSelected(data.importCompany.id);
    } catch (e) {
      alert(`Couldn't parse file \n${e.message}`);
    }
  });

  const removeCompany = useCallback(async () => {
    if (selectedCompany === "new" || selectedCompany === "") return;
    await removeC({ companyId: selectedCompany });
  }, [selectedCompany, data]);

  return (
    <div id="app">
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
            onChange={e => setSelected(e.target.value)}
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
      <Company id={selectedCompany} addCompany={createNew} />
    </div>
  );
}
