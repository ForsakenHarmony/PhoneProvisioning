import { Button, InputGroup, Intent } from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";
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
      <InputGroup
        value={phone.name}
        onChange={update.bind(null, "name")}
        id={`phone.name.${id}`}
        onFocus={focus}
        placeholder="Name"
      />
    </td>
    <td>
      <InputGroup
        value={phone.number}
        onChange={update.bind(null, "number")}
        id={`phone.number.${id}`}
        onFocus={focus}
        placeholder="42"
      />
    </td>
    <td>
      <InputGroup
        value={phone.ip}
        onChange={update.bind(null, "ip")}
        id={`phone.ip.${id}`}
        onFocus={focus}
        placeholder="192.168.X.X"
      />
    </td>
    <td>
      {(({ icon, tooltip, intent, ...props }) => (
        <Localizer>
          <button
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
        <button class="btn btn-action" onClick={remove.bind(null, id)}>
          <i class="icon icon-delete" />
        </button>
      )}
    </td>
  </tr>
);
