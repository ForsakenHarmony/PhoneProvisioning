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
  <tr key={id} id={`phone.${id}`} {...props} style={over ? "opacity: .5" : ""}>
    <td>{!last && handle}</td>
    <td>
      <input
        class="form-input"
        type="text"
        required
        pattern="[\w ]{2,}"
        // form={id}
        value={phone.name}
        onChange={update.bind(null, "name")}
        id={`phone.name.${id}`}
        onFocus={focus}
        placeholder="Name"
      />
    </td>
    <td>
      <input
        class="form-input"
        type="number"
        required
        pattern="\d+"
        aria-invalid="true"
        // form={id}
        value={phone.number}
        onChange={update.bind(null, "number")}
        id={`phone.number.${id}`}
        onFocus={focus}
        placeholder="42"
      />
    </td>
    <td>
      <input
        class="form-input"
        type="text"
        pattern="(?:[0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}"
        // form={id}
        value={phone.mac}
        onChange={update.bind(null, "mac")}
        id={`phone.mac.${id}`}
        onFocus={focus}
        placeholder="ff:ff:ff:ff:ff:ff"
      />
    </td>
    <td>
      {(({ icon, tooltip, intent, ...props }) => (
        <Localizer>
          <button
            type="button"
            class={clsx({
              "btn btn-action tooltip": true,
              [`btn-${intent}`]: true
            })}
            data-tooltip={<Text id={tooltip} />}
            {...props}
          >
            <i class={clsx({ icon: true, [`icon-${icon}`]: true })} />
          </button>
        </Localizer>
      ))(
        {
          Nonexistent: { icon: "stop", disabled: true, tooltip: "nonexistent" },
          Loading: { loading: true, tooltip: "loading" },
          Online: { icon: "check", intent: "success", tooltip: "online" },
          Offline: { icon: "cross", intent: "error", tooltip: "offline" }
        }[phone.status || "Nonexistent"]
      )}
    </td>
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
