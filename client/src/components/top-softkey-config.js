import { observer } from "mobx-react";
import { ControlGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import { Localizer, Text } from "preact-i18n";
import { softkeyTypes, TopSoftkeyTypes, toTopSoftkeyEnum } from "../constants";
import { isLabelDisabled, isValueDisabled } from "../utils";

export const TopSoftkeyConfig = observer(({ softkey, set = () => {} }) => {
  return (
    <ControlGroup vertical={true}>
      <HTMLSelect
        value={TopSoftkeyTypes[softkey.type]}
        onChange={set.bind(null, "type")}
      >
        {softkeyTypes.map(type => (
          <option value={toTopSoftkeyEnum(type)}>
            <Text id={`softkey.${type}`} />
          </option>
        ))}
      </HTMLSelect>
      <Localizer>
        <InputGroup
          value={softkey.label}
          onChange={set.bind(null, "label")}
          disabled={isLabelDisabled(softkey.type)}
          placeholder={<Text id="label" />}
        />
      </Localizer>
      <Localizer>
        <InputGroup
          value={softkey.value}
          onChange={set.bind(null, "value")}
          disabled={isValueDisabled(softkey.type)}
          placeholder={<Text id="value" />}
        />
      </Localizer>
    </ControlGroup>
  );
});
