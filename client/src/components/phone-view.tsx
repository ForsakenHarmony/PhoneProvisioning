import { Localizer, Text } from "./i18n";
import clsx from "clsx";
import { VNode } from "preact";

const u = undefined;

const StatusMap = {
  Nonexistent: {
    icon: "stop",
    intent: u,
    disabled: true,
    tooltip: "nonexistent"
  },
  Loading: { icon: u, intent: u, loading: true, tooltip: "loading" },
  Online: { icon: "check", intent: "success", tooltip: "online" },
  Offline: { icon: "cross", intent: "error", tooltip: "offline" }
};

function StatusButton({ status }: { status: keyof typeof StatusMap }) {
  const { icon, tooltip, intent, ...props } = StatusMap[status];

  return (
    <Localizer>
      <td class="tooltip" data-tooltip={<Text id={tooltip} />}>
        <button
          type="button"
          class={clsx({
            "btn btn-action": true,
            [`btn-${intent}`]: true
          })}
          {...props}
        >
          <i class={clsx({ icon: true, [`icon-${icon}`]: true })} />
        </button>
      </td>
    </Localizer>
  );
}

interface Props {
  phone: {
    name?: string | null,
    number?: string | null,
    mac?: string | null,
    status?: keyof typeof StatusMap
  };
  id: string;
  remove?: Function;
  update: Function;
  // last?: boolean;
  // focus: EventHandler<FocusEvent>;
  // created: RefCallback<any>;
  over?: boolean;
  handle?: VNode<any> | null;
  [key: string]: any;
}

export const PhoneView = ({
  phone = {},
  id,
  remove,
  update,
  // last = false,
  // focus = () => {},
  // created = () => {},
  over,
  handle,
  ...props
}: Props) => {
  return (
    <tr
      key={id}
      id={`phone.${id}`}
      style={over ? { opacity: ".5" } : {}}
      {...props}
    >
      <td>{remove && handle}</td>
      <td class="table-name-input">
        <input
          class="form-input"
          type="text"
          required
          pattern="[\w -.]{2,}"
          // form={id}
          value={phone.name!}
          onBlur={update.bind(null, "name")}
          id={`phone.name.${id}`}
          // onFocus={focus}
          // ref={created}
          placeholder="Name"
        />
      </td>
      <td class="table-number-input">
        <input
          class="form-input"
          type="number"
          required
          pattern="\d+"
          aria-invalid="true"
          // form={id}
          value={phone.number!}
          onBlur={update.bind(null, "number")}
          id={`phone.number.${id}`}
          // onFocus={focus}
          // ref={created}
          placeholder="42"
        />
      </td>
      <td class="table-mac-input">
        <input
          class="form-input"
          type="text"
          pattern="(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}"
          // form={id}
          value={phone.mac!}
          onBlur={update.bind(null, "mac")}
          id={`phone.mac.${id}`}
          // onFocus={focus}
          // ref={created}
          placeholder="ff:ff:ff:ff:ff:ff"
        />
      </td>
      <StatusButton status={phone.status || "Nonexistent"} />
      <td>
        {remove && (
          <button
            class="btn btn-action"
            type="button"
            onClick={remove.bind(null, id)}
          >
            <i class="icon icon-delete" />
          </button>
        )}
      </td>
    </tr>
  );
};
