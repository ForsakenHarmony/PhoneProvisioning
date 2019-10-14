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
import { isLabelDisabled, isValueDisabled, Obj } from "../utils";
import { useCallback, useEffect, useState } from "preact/hooks";
import { Softkey, TopSoftkey } from "../gql/types";
import { VNode } from "preact";

interface SoftkeyPopoverProps<Top extends boolean> {
  softkey: PickSoftkey<Top>,
  set: (softkey: PickSoftkey<Top>) => void,
  remove?: (id: string) => void,
  isNew?: boolean,
  loading: boolean,
}

export const createSoftkeyPopover = <Top extends boolean>(types: string[], ValToEnum: Obj, EnumToVal: Obj) => ({
  softkey,
  set = () => {},
  remove = () => {},
  isNew = false,
  loading = false
}: SoftkeyPopoverProps<Top>) => {
  const { id, type, label, value } = softkey;

  const [localSoftkey, updateSoftkey] = useState({ type, label, value });

  useEffect(() => {
    updateSoftkey({ type, label, value });
  }, [type, label, value]);

  const submit = useCallback(
    (e: Event) => {
      e.preventDefault();
      set(localSoftkey as unknown as PickSoftkey<Top>);
    },
    [localSoftkey]
  );

  const update = useCallback(
      (field: string) => {
      return (e: Event) => updateSoftkey(s => ({ ...s, [field]: (e.target! as HTMLInputElement).value }));
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
                {types.map((type: string) => (
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
                    placeholder={<Text id="label" /> as unknown as string}
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
                    placeholder={<Text id="value" /> as unknown as string}
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

export const TopSoftkeyPopover = createSoftkeyPopover<true>(
  topSoftkeyTypes,
  TopSoftkeyToEnum,
  EnumToTopSoftkey
);
export const SoftkeyPopover = createSoftkeyPopover<false>(
  softkeyTypes,
  SoftkeyToEnum,
  EnumToSoftkey
);

type PickSoftkey<T extends boolean> = T extends true ? TopSoftkey : Softkey;

interface SoftkeyConfigProps<Top extends boolean> {
  softkey: PickSoftkey<Top>,
  set: (softkey: PickSoftkey<Top>) => void,
  remove: (id: string) => void,
  loading: boolean,
  isTop: Top,
  handle: VNode<any> | null,
}

export const SoftkeyConfig = <Top extends boolean>({
  softkey,
  set,
  remove,
  isTop,
  loading,
  handle,
  ...props
}: SoftkeyConfigProps<Top>) => {
  const EnumToVal = isTop ? EnumToTopSoftkey : EnumToSoftkey;
  const [popover, setPopover] = useState(false);
  return (
    <div class="tile tile-centered" {...props}>
      {handle}
      <div class="tile-content">
        <div class="tile-title text-bold">
          {softkey.label || <Text id={`softkey.${EnumToVal[softkey.type as unknown as keyof typeof EnumToVal]}`} />}
        </div>
        <div class="tile-subtitle">
          {(softkey.label && (
            <Text id={`softkey.${EnumToVal[softkey.type as unknown as keyof typeof EnumToVal]}`} />
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
              softkey={softkey as any}
              set={set as any}
              remove={remove}
              loading={loading}
            />
          ) : (
            <SoftkeyPopover
              softkey={softkey as any}
              set={set as any}
              remove={remove}
              loading={loading}
            />
          ))}
      </div>
    </div>
  );
};
