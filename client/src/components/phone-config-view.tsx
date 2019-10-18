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
} from "../gql/index.gql";
import {
  PickSoftkey, PickSoftkeyInput,
  SoftkeyConfig,
  SoftkeyPopover,
  TopSoftkeyPopover
} from "./softkey-config";

import { useMutation } from "@pql/boost";
import { useCallback, useState } from "preact/hooks";
import { DnD } from "./dnd";
import { VNode } from "preact";
import { company_company_phones } from "../gql/gen/company";
import { SoftkeyInput, SoftkeyTypes, TopSoftkeyInput, TopSoftkeyTypes } from "../gql/gen/globalTypes";
import { addTopSoftkeyVariables } from "../gql/gen/addTopSoftkey";
import { updateTopSoftkeyVariables } from "../gql/gen/updateTopSoftkey";
import { removeTopSoftkeyVariables } from "../gql/gen/removeTopSoftkey";
import { addSoftkeyVariables } from "../gql/gen/addSoftkey";
import { updateSoftkeyVariables } from "../gql/gen/updateSoftkey";
import { removeSoftkeyVariables } from "../gql/gen/removeSoftkey";
import { copyToAllVariables } from "../gql/gen/copyToAll";
import { transferConfigVariables } from "../gql/gen/transferConfig";
import { importFromPhoneVariables } from "../gql/gen/importFromPhone";
import { moveSoftkeyVariables } from "../gql/gen/moveSoftkey";
import { moveTopSoftkeyVariables } from "../gql/gen/moveTopSoftkey";
import { updatePhoneVariables } from "../gql/gen/updatePhone";

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
  phone: company_company_phones,
}

export function PhoneConfig({ phone }: Props) {
  const [activeView, changeView] = useState<"top_softkeys" | "softkeys">("top_softkeys");
  const [settingSoftkey, setSettingSoftkey] = useState(false);
  const [copying, setCopying] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState(null);

  const [{}, addTopSoftkeyM] = useMutation<any, addTopSoftkeyVariables>(addTopSoftkeyMut);
  const [{}, updateTopSoftkeyM] = useMutation<any, updateTopSoftkeyVariables>(updateTopSoftkeyMut);
  const [{}, removeTopSoftkeyM] = useMutation<any, removeTopSoftkeyVariables>(removeTopSoftkeyMut);
  const [{}, addSoftkeyM] = useMutation<any, addSoftkeyVariables>(addSoftkeyMut);
  const [{}, updateSoftkeyM] = useMutation<any, updateSoftkeyVariables>(updateSoftkeyMut);
  const [{}, removeSoftkeyM] = useMutation<any, removeSoftkeyVariables>(removeSoftkeyMut);
  const [{}, copyToAllM] = useMutation<any, copyToAllVariables>(copyToAllMut);
  const [{}, transferConfigM] = useMutation<any, transferConfigVariables>(transferConfigMut);
  const [{}, importConfig] = useMutation<any, importFromPhoneVariables>(importFromPhone);
  const [{}, moveSoftkey] = useMutation<any, moveSoftkeyVariables>(moveSoftkeyMut);
  const [{}, moveTopSoftkey] = useMutation<any, moveTopSoftkeyVariables>(moveTopSoftkeyMut);
  const [{ fetching: updateFetching }, updatePhone] = useMutation<any, updatePhoneVariables>(
    updatePhoneMut
  );

  const move = useCallback(
    async (from: string, to: string) => {
      const view: "topSoftkeys" | "softkeys" = activeView === "top_softkeys" ? "topSoftkeys" : "softkeys";
      const prev = phone[view];
      try {
        const next: { id: string }[] = phone[view].slice();
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
      {isTop ? (
        <TopSoftkeyDnD
          isTop={isTop}
          removeSoftkey={removeTopSoftkey}
          updateSoftkey={updateTopSoftkey}
          softkeys={phone.topSoftkeys}
          settingSoftkey={settingSoftkey}
          move={move} />
      ) : (
        <SoftkeyDnD
          isTop={isTop}
          removeSoftkey={removeSoftkey}
          updateSoftkey={updateSoftkey}
          softkeys={phone.softkeys}
          settingSoftkey={settingSoftkey}
          move={move} />
      )}
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
              softkey={{ type: TopSoftkeyTypes.None, id: "new", label: "", value: "" }}
              isNew={true}
              set={addTopSoftkey}
              loading={settingSoftkey}
            />
          ) : (
            <SoftkeyPopover
              softkey={{ type: SoftkeyTypes.None, id: "new", label: "", value: "" }}
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

interface SoftkeyDnDProps<Top extends boolean> {
  isTop: Top,
  settingSoftkey: boolean,
  updateSoftkey: (id: string, softkey: PickSoftkeyInput<Top>) => void,
  removeSoftkey: (id: string) => void,
  move: (from: string, to: string) => void,
  softkeys: PickSoftkey<Top>[],
}

function SoftkeyDnD<Top extends boolean = false>({ settingSoftkey, updateSoftkey, removeSoftkey, softkeys, isTop, move }: SoftkeyDnDProps<Top>) {
  return (
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
        (
          <SoftkeyConfig
            softkey={data}
            set={updateSoftkey.bind(null, data.id)}
            remove={removeSoftkey}
            loading={settingSoftkey}
            isTop={isTop}
            {...props}
          />
        )
      }
      items={
        softkeys
      }
      prop="id"
      onMove={move}
    />
  );
}

const TopSoftkeyDnD: (props: SoftkeyDnDProps<true>) => VNode<any> = SoftkeyDnD;

// type SoftkeyDndFn = typeof SoftkeyDnD;

// const TopSoftkeyDnD: SoftkeyDndFn<true> = SoftkeyDnD;

// function TopSoftkeyDnD(props: SoftkeyDnDProps<true>) {
//   return SoftkeyDnD(props);
// }
