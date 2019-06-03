import { Localizer, Text } from "./i18n";
import { Copy, Plus, Save, Download, UserX, UserCheck } from "preact-feather";
import clsx from "clsx";
import {
  addSoftkey as addSoftkeyMut,
  addTopSoftkey as addTopSoftkeyMut,
  copyToAll as copyToAllMut,
  importFromPhone,
  removeSoftkey as removeSoftkeyMut,
  removeTopSoftkey as removeTopSoftkeyMut,
  transferConfig as transferConfigMut,
  updatePhone,
  updateSoftkey as updateSoftkeyMut,
  updateTopSoftkey as updateTopSoftkeyMut
} from "../gql/index.gql";
import {
  SoftkeyConfig,
  SoftkeyPopover,
  TopSoftkeyPopover
} from "./softkey-config";

import { useMutation } from "@pql/boost";
import { useCallback, useEffect, useState } from "preact/hooks";

function useManagedMutation(
  statusSetter,
  errorSetter,
  mutation,
  variablesFn,
  additional
) {
  return useCallback(
    async (...args) => {
      try {
        statusSetter(true);
        await mutation(variablesFn.apply(null, args));
        errorSetter(null);
      } catch (e) {
        errorSetter(e);
      } finally {
        statusSetter(false);
      }
    },
    [mutation, statusSetter, errorSetter, ...additional]
  );
}

export function PhoneConfig({ phone }) {
  const [activeView, changeView] = useState("top_softkeys");
  const [settingSoftkey, setSettingSoftkey] = useState(false);
  const [copying, setCopying] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState(null);

  const [{}, addTopSoftkeyM] = useMutation(addTopSoftkeyMut);
  const [{}, updateTopSoftkeyM] = useMutation(updateTopSoftkeyMut);
  const [{}, removeTopSoftkeyM] = useMutation(removeTopSoftkeyMut);
  const [{}, addSoftkeyM] = useMutation(addSoftkeyMut);
  const [{}, updateSoftkeyM] = useMutation(updateSoftkeyMut);
  const [{}, removeSoftkeyM] = useMutation(removeSoftkeyMut);
  const [{}, copyToAllM] = useMutation(copyToAllMut);
  const [{}, transferConfigM] = useMutation(transferConfigMut);
  const [{}, importConfigM] = useMutation(importFromPhone);

  const [{ fetching: updateFetching }, updatePhoneMut] = useMutation(
    updatePhone
  );

  const updateSkip = useCallback(
    skip => {
      if (!phone) return;
      updatePhoneMut({
        id: phone.id,
        phone: {
          name: phone.name,
          number: phone.number,
          mac: phone.mac,
          skipContacts: skip
        }
      })
        .then(() => setError(null))
        .catch(e => setError(e));
    },
    [updatePhoneMut, phone]
  );

  function useManagedSoftkey(mut, varFn) {
    return useManagedMutation(setSettingSoftkey, setError, mut, varFn, [
      phone.id
    ]);
  }

  const importSoftkeys = useManagedSoftkey(importConfigM, () => ({
    id: phone.id
  }));

  const addTopSoftkey = useManagedSoftkey(addTopSoftkeyM, softkey => ({
    phoneId: phone.id,
    softkey
  }));
  const removeTopSoftkey = useManagedSoftkey(removeTopSoftkeyM, id => ({ id }));
  const updateTopSoftkey = useManagedSoftkey(
    updateTopSoftkeyM,
    (id, softkey) => ({ id, softkey })
  );

  const addSoftkey = useManagedSoftkey(addSoftkeyM, softkey => ({
    phoneId: phone.id,
    softkey
  }));
  const removeSoftkey = useManagedSoftkey(removeSoftkeyM, id => ({ id }));
  const updateSoftkey = useManagedSoftkey(updateSoftkeyM, (id, softkey) => ({
    id,
    softkey
  }));

  const copyToAll = useManagedMutation(
    setCopying,
    setError,
    copyToAllM,
    () => ({ phoneId: phone.id }),
    [phone.id]
  );
  const transferConfig = useManagedMutation(
    setTransferring,
    setError,
    transferConfigM,
    () => ({ phoneId: phone.id }),
    [phone.id]
  );

  return (
    <div class="card card-softkey panel">
      <div class="panel-header text-center" style={{ position: "relative" }}>
        <Localizer>
          <div
            className="tooltip tooltip-bottom p-absolute"
            style={{ right: "0.4rem" }}
            data-tooltip={
              <Text
                id={phone.skipContacts ? "without_contacts" : "with_contacts"}
              />
            }
          >
            <button
              type="button"
              className={clsx(
                "btn btn-action",
                { loading: updateFetching },
                phone.skipContacts ? "btn-error" : "btn-primary"
              )}
              onClick={updateSkip.bind(null, !phone.skipContacts)}
            >
              {phone.skipContacts ? <UserX /> : <UserCheck />}
            </button>
          </div>
        </Localizer>
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
              onClick={changeView.bind(this, "top_softkeys")}
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
              onClick={changeView.bind(this, "softkeys")}
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
                set={updateTopSoftkey.bind(null, softkey.id)}
                remove={removeTopSoftkey}
                isTop={true}
                loading={settingSoftkey}
              />
            ))
          : phone.softkeys.map(softkey => (
              <SoftkeyConfig
                softkey={softkey}
                set={updateSoftkey.bind(null, softkey.id)}
                remove={removeSoftkey}
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
                loading: transferring
              })}
              data-tooltip={<Text id="transfer_config" />}
              onClick={transferConfig}
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
              set={addTopSoftkey}
              loading={settingSoftkey}
            />
          ) : (
            <SoftkeyPopover
              softkey={{ type: "None", id: "new" }}
              isNew={true}
              set={addSoftkey}
              loading={settingSoftkey}
            />
          )}
          <Localizer>
            <button
              type="button"
              class={clsx("btn btn-primary btn-action tooltip", {
                loading: copying
              })}
              data-tooltip={<Text id="copy_to_all" />}
              onClick={copyToAll}
            >
              <Copy />
            </button>
          </Localizer>
          <Localizer>
            <button
              type="button"
              class={clsx("btn btn-primary btn-action tooltip", {
                loading: settingSoftkey
              })}
              data-tooltip={<Text id="import_softkeys" />}
              onClick={importSoftkeys}
            >
              <Download />
            </button>
          </Localizer>
        </div>
      </div>
    </div>
  );
}
