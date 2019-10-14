import { Localizer, Text } from "./i18n";
import {
  Copy,
  Plus,
  Save,
  Download,
  UserX,
  UserCheck,
  Phone as PhoneIcon,
  Hash
} from "preact-feather";
import clsx from "clsx";
import {
  addSoftkey as addSoftkeyMut,
  addTopSoftkey as addTopSoftkeyMut,
  copyToAll as copyToAllMut,
  importFromPhone,
  removeSoftkey as removeSoftkeyMut,
  removeTopSoftkey as removeTopSoftkeyMut,
  transferConfig as transferConfigMut,
  updatePhone as updatePhoneMut,
  updateSoftkey as updateSoftkeyMut,
  updateTopSoftkey as updateTopSoftkeyMut,
  moveSoftkey as moveSoftkeyMut,
  moveTopSoftkey as moveTopSoftkeyMut,
  AddTopSoftkeyMutationArgs,
  UpdateTopSoftkeyMutationArgs,
  RemoveTopSoftkeyMutationArgs,
  AddSoftkeyMutationArgs,
  UpdateSoftkeyMutationArgs,
  RemoveSoftkeyMutationArgs,
  CopyToAllMutationArgs,
  TransferConfigMutationArgs,
  ImportFromPhoneMutationArgs,
  MoveSoftkeyMutationArgs,
  MoveTopSoftkeyMutationArgs, UpdatePhoneMutationArgs
} from "../gql/index.gql";
import {
  SoftkeyConfig,
  SoftkeyPopover,
  TopSoftkeyPopover
} from "./softkey-config";

import { useMutation } from "@pql/boost";
import { useCallback, useState } from "preact/hooks";
import { DnD } from "./dnd";
import { CommonSoftkey, Phone, SoftkeyInput, SoftkeyTypes, TopSoftkeyInput, TopSoftkeyTypes } from "../gql/types";

function useManagedMutation<Vars extends Array<any>, MutVars>(
  statusSetter: (status: boolean) => void,
  errorSetter: (error: any) => void,
  mutation: (vars: MutVars) => Promise<any>,
  variablesFn: (...args: Vars) => MutVars,
  additional: any[]
) {
  return useCallback(
    async (...args: Vars) => {
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

interface Props {
  phone: Phone,
}

export function PhoneConfig({ phone }: Props) {
  const [activeView, changeView] = useState<"top_softkeys" | "softkeys">("top_softkeys");
  const [settingSoftkey, setSettingSoftkey] = useState(false);
  const [copying, setCopying] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState(null);

  const [{}, addTopSoftkeyM] = useMutation<any, AddTopSoftkeyMutationArgs>(addTopSoftkeyMut);
  const [{}, updateTopSoftkeyM] = useMutation<any, UpdateTopSoftkeyMutationArgs>(updateTopSoftkeyMut);
  const [{}, removeTopSoftkeyM] = useMutation<any, RemoveTopSoftkeyMutationArgs>(removeTopSoftkeyMut);
  const [{}, addSoftkeyM] = useMutation<any, AddSoftkeyMutationArgs>(addSoftkeyMut);
  const [{}, updateSoftkeyM] = useMutation<any, UpdateSoftkeyMutationArgs>(updateSoftkeyMut);
  const [{}, removeSoftkeyM] = useMutation<any, RemoveSoftkeyMutationArgs>(removeSoftkeyMut);
  const [{}, copyToAllM] = useMutation<any, CopyToAllMutationArgs>(copyToAllMut);
  const [{}, transferConfigM] = useMutation<any, TransferConfigMutationArgs>(transferConfigMut);
  const [{}, importConfig] = useMutation<any, ImportFromPhoneMutationArgs>(importFromPhone);
  const [{}, moveSoftkey] = useMutation<any, MoveSoftkeyMutationArgs>(moveSoftkeyMut);
  const [{}, moveTopSoftkey] = useMutation<any, MoveTopSoftkeyMutationArgs>(moveTopSoftkeyMut);
  const [{ fetching: updateFetching }, updatePhone] = useMutation<any, UpdatePhoneMutationArgs>(
    updatePhoneMut
  );

  const move = useCallback(
    async (from: string, to: string) => {
      const view: "topSoftkeys" | "softkeys" = activeView === "top_softkeys" ? "topSoftkeys" : "softkeys";
      const prev: CommonSoftkey[] = phone[view];
      try {
        const next: CommonSoftkey[] = phone[view].slice();
        const movedIndex = next.findIndex(p => p.id === from);
        const toIndex = next.findIndex(p => p.id === to);
        const moved = next.splice(movedIndex, 1)[0];
        next.splice(toIndex, 0, moved);
        phone[view] = next as any;

        await (activeView === "top_softkeys" ? moveTopSoftkey : moveSoftkey)({
          from,
          to
        });
        setError(null);
      } catch (e) {
        console.error(e);
        setError(e);
        phone[view] = prev as any;
      }
    },
    [moveSoftkey, moveTopSoftkey, activeView]
  );

  const updateSkip = useCallback(
    (skip: boolean) => {
      if (!phone) return;
      updatePhone({
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
    [updatePhone, phone]
  );

  function useManagedSoftkey<Vars extends any[], MutVars>(mut: (vars: MutVars) => Promise<any>, varFn: (...args: Vars) => MutVars) {
    return useManagedMutation(setSettingSoftkey, setError, mut, varFn, [
      phone.id
    ]);
  }

  const importSoftkeys = useManagedSoftkey(importConfig, () => ({
    id: phone.id
  }));

  const addTopSoftkey = useManagedSoftkey(addTopSoftkeyM, (softkey: TopSoftkeyInput) => ({
    phoneId: phone.id,
    softkey
  }));
  const removeTopSoftkey = useManagedSoftkey(removeTopSoftkeyM, (id: string) => ({ id }));
  const updateTopSoftkey = useManagedSoftkey(
    updateTopSoftkeyM,
    (id: string, softkey: TopSoftkeyInput) => ({ id, softkey })
  );

  const addSoftkey = useManagedSoftkey(addSoftkeyM, (softkey: SoftkeyInput) => ({
    phoneId: phone.id,
    softkey
  }));
  const removeSoftkey = useManagedSoftkey(removeSoftkeyM, (id: string) => ({ id }));
  const updateSoftkey = useManagedSoftkey(updateSoftkeyM, (id: string, softkey: SoftkeyInput) => ({
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

  const isTop = activeView === "top_softkeys";

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
        <div class="panel-subtitle h6">
          {phone.type && (
            <span>
              <PhoneIcon size={20} />
              {phone.type}{" "}
            </span>
          )}
          <span>
            <Hash size={20} />
            {phone.number}
          </span>
        </div>
        {error && <div class="panel-subtitle text-error">{error}</div>}
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
              onClick={changeView.bind(null, "top_softkeys")}
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
              onClick={changeView.bind(null, "softkeys")}
            >
              <Text id="softkeys" />
            </a>
          </li>
        </ul>
      </nav>
      <DnD
        handle={({ ...props }) => (
          <button
            class={clsx("btn btn-action", { settingSoftkey })}
            type="button"
            {...props}
          >
            <i class="icon icon-resize-vert" />
          </button>
        )}
        container={({ children, ...props }) => (
          <div class="panel-body" {...props}>
            {children}
          </div>
        )}
        item={({ data, ...props }) =>
          isTop ? (
            <SoftkeyConfig
              softkey={data}
              set={updateTopSoftkey.bind(null, data.id)}
              remove={removeTopSoftkey}
              loading={settingSoftkey}
              isTop={true}
              {...props}
            />
          ) : (
            <SoftkeyConfig
              softkey={data}
              set={updateSoftkey.bind(null, data.id)}
              remove={removeSoftkey}
              loading={settingSoftkey}
              isTop={false}
              {...props}
            />
          )
        }
        items={
          isTop ? phone.topSoftkeys : phone.softkeys
        }
        prop="id"
        onMove={move}
      />
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
          {isTop ? (
            <TopSoftkeyPopover
              softkey={{ type: TopSoftkeyTypes.None, id: "new" }}
              isNew={true}
              set={addTopSoftkey}
              loading={settingSoftkey}
            />
          ) : (
            <SoftkeyPopover
              softkey={{ type: SoftkeyTypes.None, id: "new" }}
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
