import { Text } from "./i18n";
import { DnD } from "./dnd";
import { PhoneView } from "./phone-view";
import {
  addPhone,
  removePhone,
  movePhones,
  transferConfigToAll,
  updatePhone,
  findPhones
} from "../gql/index.gql";
import clsx from "clsx";
import { useMutation } from "@pql/boost";
import { useCallback, useEffect, useState } from "preact/hooks";
import genUUID from "uuid/v4";
import { EventWithValue } from "../utils";
import { company_company, company_company_phones } from "../gql/gen/company";
import { addPhoneVariables } from "../gql/gen/addPhone";
import { removePhoneVariables } from "../gql/gen/removePhone";
import { movePhonesVariables } from "../gql/gen/movePhones";
import { transferConfigToAllVariables } from "../gql/gen/transferConfigToAll";
import { updatePhoneVariables } from "../gql/gen/updatePhone";
import { findPhonesVariables } from "../gql/gen/findPhones";

interface Props {
  company: company_company;
}

export function CompanyPhones({ company }: Props) {
  const [{ fetching: addFetching }, addPhoneMut] = useMutation<
    any,
    addPhoneVariables
  >(addPhone);
  const [{ fetching: removeFetching }, removePhoneMut] = useMutation<
    any,
    removePhoneVariables
  >(removePhone);
  const [{ fetching: moveFetching }, movePhonesMut] = useMutation<
    any,
    movePhonesVariables
  >(movePhones);
  const [{ fetching: transferFetching }, transferMut] = useMutation<
    any,
    transferConfigToAllVariables
  >(transferConfigToAll);
  const [{ fetching: updateFetching }, updatePhoneMut] = useMutation<
    any,
    updatePhoneVariables
  >(updatePhone);
  const [{ fetching: findFetching }, findPhonesMut] = useMutation<
    any,
    findPhonesVariables
  >(findPhones);

  const loading =
    addFetching ||
    removeFetching ||
    moveFetching ||
    transferFetching ||
    updateFetching ||
    findFetching;

  const [phoneState, setState] = useState({
    id: genUUID(),
    name: null,
    mac: null,
    number: null
  });
  const [error, setError] = useState(null);

  const [skipThing, setSkipThing] = useState(false);
  useEffect(() => {
    async function addPhone() {
      if (!phoneState.name || !phoneState.number || addFetching || skipThing)
        return;
      company.phones.push((phoneState as unknown) as company_company_phones);
      setSkipThing(true);
      try {
        setState({
          id: genUUID(),
          name: null,
          mac: null,
          number: null
        });
        const { number, name, mac, id } = phoneState;
        await addPhoneMut({
          companyId: company.id,
          phone: {
            id,
            mac,
            name: name!,
            number: number!
          }
        });
        setError(null);
      } catch (e) {
        setError(e);
      } finally {
        setSkipThing(false);
      }
    }
    addPhone().catch(e => console.error("Everything is fucked", e));
  }, [phoneState, company.id, addFetching, error]);

  const updateState = useCallback(
    (field: string, e: EventWithValue) => {
      setState(s => ({ ...s, [field]: e.target.value }));
    },
    [setState]
  );

  const remove = useCallback(
    (id: string) => {
      removePhoneMut({ id })
        .then(() => setError(null))
        .catch(e => setError(e));
    },
    [removePhoneMut]
  );

  const update = useCallback(
    (id: string, field: "name" | "number" | "mac", e: EventWithValue) => {
      const phone = company.phones.find(p => p.id === id);
      if (!phone) return;
      phone[field] = e.target.value;
      if (!phone) return;
      updatePhoneMut({
        id,
        phone: {
          name: phone.name,
          number: phone.number,
          mac: phone.mac,
          skipContacts: phone.skipContacts
        }
      })
        .then(() => setError(null))
        .catch(e => setError(e));
    },
    [updatePhoneMut, company]
  );

  const move = useCallback(
    async (from: string, to: string) => {
      const prev = company.phones;
      try {
        const next = company.phones.slice();
        const movedIndex = next.findIndex(p => p.id === from);
        const toIndex = next.findIndex(p => p.id === to);
        const moved = next.splice(movedIndex, 1)[0];
        next.splice(toIndex, 0, moved);
        company.phones = next;

        await movePhonesMut({
          from,
          to
        });
        setError(null);
      } catch (e) {
        setError(e);
        company.phones = prev;
      }
    },
    [movePhonesMut]
  );

  const transfer = useCallback(() => {
    transferMut({
      companyId: company.id
    })
      .then(() => setError(null))
      .catch(e => setError(e));
  }, [transferMut, company]);

  const find = useCallback(() => {
    findPhonesMut({
      companyId: company.id
    })
      .then(() => setError(null))
      .catch(e => setError(e));
  }, [findPhonesMut, company]);

  return (
    <div class="card card-phones" id="list">
      <div class="card-header">
        <div class="card-title h5">
          <Text id="phones" />
          {error && <div class="bg-error">{JSON.stringify(error)}</div>}
        </div>
      </div>
      <div class="card-body">
        <table class="table" style={{ position: "relative" }}>
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
              <button
                class={clsx("btn btn-action", { loading })}
                type="button"
                {...props}
              >
                <i class="icon icon-resize-vert" />
              </button>
            )}
            container={({ children, ...props }) => (
              <tbody {...props}>
                {children}
                <PhoneView
                  phone={phoneState}
                  id={phoneState.id}
                  key={phoneState.id}
                  update={updateState}
                />
              </tbody>
            )}
            item={({ data, ...props }) => (
              <PhoneView
                phone={data}
                id={data.id}
                remove={remove.bind(null, data.id)}
                update={update.bind(null, data.id)}
                {...props}
              />
            )}
            items={company.phones}
            prop="id"
            onMove={move}
          />
        </table>
      </div>

      <div class="card-footer">
        <button
          class={clsx("btn btn-primary", { loading: loading })}
          onClick={transfer}
        >
          <Text id="transfer_config" />
        </button>
        <button
          className={clsx("btn btn-primary", { loading: loading })}
          onClick={find}
        >
          <Text id="find_phones" />
        </button>
      </div>
    </div>
  );
}
