import { Localizer, Text } from "preact-i18n";
import { Edit, Trash } from "preact-feather";
import { Component } from "preact";
import lst from "linkstate";
import clsx from "clsx";
import {
  EnumToSoftkey,
  EnumToTopSoftkey,
  SoftkeyToEnum,
  softkeyTypes,
  TopSoftkeyToEnum,
  topSoftkeyTypes
} from "../constants";
import { isLabelDisabled, isValueDisabled } from "../utils";

export const createSoftkeyPopover = (types, ValToEnum, EnumToVal) =>
  class SoftkeyPopover extends Component {
    constructor(props, context) {
      super(props, context);
      this.state.softkey = props.softkey;
    }

    componentDidUpdate(previousProps, previousState, previousContext) {
      if (this.props.softkey !== this.state.softkey) {
        this.setState({
          softkey: this.props.softkey
        });
      }
    }

    submit = e => {
      e.preventDefault();
      const { type, label, value } = this.state.softkey;
      this.props.set({ type, label, value });
    };

    render(
      {
        softkey,
        set = () => {},
        remove = () => {},
        isNew = false,
        loading = false
      },
      {
        softkey: { id, type, label, value }
      },
      {}
    ) {
      return (
        <div class="popover-container">
          <div class="card">
            <div class="card-body">
              <form
                class="form-horizontal"
                id={`${id}.form`}
                onSubmit={this.submit}
              >
                <div class="form-group">
                  <select
                    class="form-select"
                    id={`${id}.type`}
                    value={type}
                    onChange={lst(this, "softkey.type")}
                  >
                    {types.map(type => (
                      <option value={ValToEnum[type]}>
                        <Text id={`softkey.${type}`} />
                      </option>
                    ))}
                  </select>
                </div>
                {isLabelDisabled(EnumToVal[type]) ? null : (
                  <div class="form-group">
                    <Localizer>
                      <input
                        class="form-input"
                        type="text"
                        id={`${id}.label`}
                        value={label}
                        onChange={lst(this, "softkey.label")}
                        placeholder={<Text id="label" />}
                      />
                    </Localizer>
                  </div>
                )}
                {isValueDisabled(EnumToVal[type]) ? null : (
                  <div class="form-group">
                    <Localizer>
                      <input
                        class="form-input"
                        type="text"
                        id={`${id}.value`}
                        value={value}
                        onChange={lst(this, "softkey.value")}
                        placeholder={<Text id="value" />}
                      />
                    </Localizer>
                  </div>
                )}
              </form>
            </div>
            <div class="card-footer">
              <button
                class={clsx("btn btn-primary", {
                  "loading": loading
                })}
                form={`${id}.type`}
                onClick={this.submit}
              >
                <Text id="save" />
              </button>
              {!isNew && (
                <button
                  class={clsx("btn btn-error btn-action", {
                    "loading": loading
                  })}
                  onClick={remove.bind(null, id)}
                >
                  <Trash />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

export const TopSoftkeyPopover = createSoftkeyPopover(
  topSoftkeyTypes,
  TopSoftkeyToEnum,
  EnumToTopSoftkey
);
export const SoftkeyPopover = createSoftkeyPopover(
  softkeyTypes,
  SoftkeyToEnum,
  EnumToSoftkey
);

export const SoftkeyConfig = ({
  softkey,
  set,
  remove,
  isTop = false,
  loading
}) => {
  const EnumToVal = isTop ? EnumToTopSoftkey : EnumToSoftkey;
  return (
    <div class="tile tile-centered">
      <div class="tile-content">
        <div class="tile-title text-bold">
          {softkey.label || <Text id={`softkey.${EnumToVal[softkey.type]}`} />}
        </div>
        <div class="tile-subtitle">
          {(softkey.label && (
            <Text id={`softkey.${EnumToVal[softkey.type]}`} />
          )) ||
            "\u00A0"}{" "}
          {softkey.value && `[ ${softkey.value} ]`}
        </div>
      </div>
      <div class="tile-action popover popover-left">
        <Localizer>
          <button
            type="button"
            class="btn btn-link btn-action btn-lg"
          >
            <Edit />
          </button>
        </Localizer>
        {isTop ? (
          <TopSoftkeyPopover
            softkey={softkey}
            set={set}
            remove={remove}
            loading={loading}
          />
        ) : (
          <SoftkeyPopover
            softkey={softkey}
            set={set}
            remove={remove}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
