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
    name: null,
    mac: null,
    number: null
  });
  const [error, setError] = useState(null);

  const [skipThing, setSkipThing] = useState(false);
  useEffect(async () => {
    if (!phoneState.name || !phoneState.number || addFetching || skipThing)
      return;
    setSkipThing(true);
    try {
      await addPhoneMut({
        companyId: company.id,
        phone: phoneState
      });
      setState({
        name: null,
        mac: null,
        number: null
      });
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setSkipThing(false);
    }
  }, [phoneState, company.id, addFetching, error]);

  const table = useRef();
  const focused = useRef(null);
  const lastLen = useRef(company.phones.length);
  console.log("fn", lastLen.current, company.phones.length, focused.current);
  useEffect(() => {
    if (!table.current) return;
    const observer = new MutationObserver(mutations => {
      console.log("mutation", mutations);
    });
    observer.observe(table.current, {
      childList: true,
      subtree: true,
      attributes: true
    });
    return observer.disconnect.bind(observer);
  }, [table.current]);
  useEffect(() => {
    console.log(
      "effect",
      lastLen.current,
      company.phones.length,
      focused.current
    );
  }, [focused.current, company.phones.length]);
  useLayoutEffect(() => {
    console.log(
      "layout",
      lastLen.current,
      company.phones.length,
      focused.current
    );
    const currentPhones = company.phones.length;
    const lastPhones = lastLen.current;
    const focusedEl = focused.current;

    if (
      currentPhones > lastPhones &&
      focusedEl &&
      focusedEl.id.endsWith("new")
    ) {
      document
        .getElementById(
          `phone.${focusedEl.id.split(".")[1]}.${
            company.phones[company.phones.length - 1].id
          }`
        )
        .focus();
    }

    lastLen.current = company.phones.length;
  }, [focused.current, company.phones.length]);

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
    (from, to) => {
      movePhonesMut({
        from,
        to
      })
        .then(() => setError(null))
        .catch(e => setError(e));
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
        {/*{company.phones.map(phone => (*/}
        {/*  <form*/}
        {/*    id={phone.id}*/}
        {/*    onSubmit={this.submitPhone.bind(null, phone.id)}*/}
        {/*  >*/}
        {/*    <button style={{ display: "none" }} />*/}
        {/*  </form>*/}
        {/*))}*/}
        {/*<form id="new" onSubmit={this.submitPhone.bind(null, "new")}>*/}
        {/*  <button style={{ display: "none" }} />*/}
        {/*</form>*/}
        <table class="table" style={{ position: "relative" }} ref={table}>
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
                  id="new"
                  phone={phoneState}
                  update={updateState}
                  focus={e => (focused.current = e.target)}
                  last={true}
                />
              </tbody>
            )}
            item={({ data, ...props }) => (
              <PhoneView
                phone={data}
                id={data.id}
                remove={remove.bind(null, data.id)}
                update={update.bind(null, data.id)}
                focus={e => (focused.current = e.target)}
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
