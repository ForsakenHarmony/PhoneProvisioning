import { Localizer, Text } from "./i18n";
import { Edit, Trash } from "preact-feather";
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
import { useCallback, useEffect, useState } from "preact/hooks";

export const createSoftkeyPopover = (types, ValToEnum, EnumToVal) => ({
  softkey,
  set = () => {},
  remove = () => {},
  isNew = false,
  loading = false
}) => {
  const { id, type, label, value } = softkey;

  const [localSoftkey, updateSoftkey] = useState({ type, label, value });

  useEffect(() => {
    updateSoftkey({ type, label, value });
  }, [type, label, value]);

  const submit = useCallback(
    e => {
      e.preventDefault();
      set(localSoftkey);
    },
    [localSoftkey]
  );

  const update = useCallback(
    field => {
      return e => updateSoftkey(s => ({ ...s, [field]: e.target.value }));
    },
    [updateSoftkey]
  );

  return (
    <div class="popover-container">
      <div class="card">
        <div class="card-body">
          <form class="form-horizontal" id={`${id}.form`} onSubmit={submit}>
            <div class="form-group">
              <select
                class="form-select"
                id={`${id}.type`}
                value={localSoftkey.type}
                onChange={update("type")}
              >
                {types.map(type => (
                  <option value={ValToEnum[type]}>
                    <Text id={`softkey.${type}`} />
                  </option>
                ))}
              </select>
            </div>
            {isLabelDisabled(EnumToVal[localSoftkey.type]) ? null : (
              <div class="form-group">
                <Localizer>
                  <input
                    class="form-input"
                    type="text"
                    id={`${id}.label`}
                    value={localSoftkey.label}
                    onChange={update("label")}
                    placeholder={<Text id="label" />}
                  />
                </Localizer>
              </div>
            )}
            {isValueDisabled(EnumToVal[localSoftkey.type]) ? null : (
              <div class="form-group">
                <Localizer>
                  <input
                    class="form-input"
                    type="text"
                    id={`${id}.value`}
                    value={localSoftkey.value}
                    onChange={update("value")}
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
              loading: loading
            })}
            // form={`${id}.type`}
            onClick={submit}
          >
            <Text id="save" />
          </button>
          {!isNew && (
            <button
              class={clsx("btn btn-error btn-action", {
                loading: loading
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
  loading,
  handle,
  ...props
}) => {
  const EnumToVal = isTop ? EnumToTopSoftkey : EnumToSoftkey;
  const [popover, setPopover] = useState(false);
  return (
    <div class="tile tile-centered" {...props}>
      {handle}
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
      <div
        class="tile-action popover popover-left"
        onMouseEnter={() => setPopover(true)}
        onMouseLeave={() => setPopover(false)}
      >
        <Localizer>
          <button type="button" class="btn btn-link btn-action btn-lg">
            <Edit />
          </button>
        </Localizer>
        {popover &&
          (isTop ? (
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
          ))}
      </div>
    </div>
  );
};
