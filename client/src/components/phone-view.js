import { Localizer, Text } from "./i18n";
import clsx from "clsx";

export const PhoneView = ({
  phone = {},
  id,
  remove,
  update,
  last = false,
  focus = () => {},
  over,
  handle,
  ...props
}) => (
  <tr
    key={id}
    id={`phone.${id}`}
    style={over ? { opacity: ".5" } : {}}
    {...props}
  >
    <td>{!last && handle}</td>
    <td class="table-name-input">
      <input
        class="form-input"
        type="text"
        required
        pattern="[\w ]{2,}"
        // form={id}
        value={phone.name}
        onBlur={update.bind(null, "name")}
        id={`phone.name.${id}`}
        onFocus={focus}
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
        value={phone.number}
        onBlur={update.bind(null, "number")}
        id={`phone.number.${id}`}
        onFocus={focus}
        placeholder="42"
      />
    </td>
    <td class="table-mac-input">
      <input
        class="form-input"
        type="text"
        pattern="(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}"
        // form={id}
        value={phone.mac}
        onBlur={update.bind(null, "mac")}
        id={`phone.mac.${id}`}
        onFocus={focus}
        placeholder="ff:ff:ff:ff:ff:ff"
      />
    </td>
    {(({ icon, tooltip, intent, ...props }) => (
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
    ))(
      {
        Nonexistent: { icon: "stop", disabled: true, tooltip: "nonexistent" },
        Loading: { loading: true, tooltip: "loading" },
        Online: { icon: "check", intent: "success", tooltip: "online" },
        Offline: { icon: "cross", intent: "error", tooltip: "offline" }
      }[phone.status || "Nonexistent"]
    )}
    <td>
      {!last && (
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
