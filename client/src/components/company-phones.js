import { Text } from "./i18n";
import { DnD } from "./dnd";
import { PhoneView } from "./phone-view";
import {
  addPhone,
  removePhone,
  movePhones,
  transferConfigToAll,
  updatePhone
} from "../gql/index.gql";
import clsx from "clsx";
import { useMutation } from "@pql/boost";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "preact/hooks";
import genUUID from "uuid/v4";

export function CompanyPhones({ company }) {
  const [{ fetching: addFetching }, addPhoneMut] = useMutation(addPhone);
  const [{ fetching: removeFetching }, removePhoneMut] = useMutation(
    removePhone
  );
  const [{ fetching: moveFetching }, movePhonesMut] = useMutation(movePhones);
  const [{ fetching: transferFetching }, transferMut] = useMutation(
    transferConfigToAll
  );
  const [{ fetching: updateFetching }, updatePhoneMut] = useMutation(
    updatePhone
  );

  const loading =
    addFetching ||
    removeFetching ||
    moveFetching ||
    transferFetching ||
    updateFetching;

  const [phoneState, setState] = useState({
    id: genUUID(),
    name: null,
    mac: null,
    number: null
  });
  const [error, setError] = useState(null);

  const [skipThing, setSkipThing] = useState(false);
  useEffect(async () => {
    if (!phoneState.name || !phoneState.number || addFetching || skipThing)
      return;
    company.phones.push(phoneState);
    setSkipThing(true);
    try {
      setState({
        id: genUUID(),
        name: null,
        mac: null,
        number: null
      });
      await addPhoneMut({
        companyId: company.id,
        phone: phoneState
      });
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setSkipThing(false);
    }
  }, [phoneState, company.id, addFetching, error]);

  const updateState = useCallback(
    (field, e) => {
      setState(s => ({ ...s, [field]: e.target.value }));
    },
    [setState]
  );

  const remove = useCallback(
    id => {
      removePhoneMut({ id })
        .then(() => setError(null))
        .catch(e => setError(e));
    },
    [removePhoneMut]
  );

  const update = useCallback(
    (id, field, e) => {
      const phone = company.phones.find(p => p.id === id);
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
    async (from, to) => {
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
      </div>
    </div>
  );
}
