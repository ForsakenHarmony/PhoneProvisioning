import { Button, Card, Divider, H5 } from "@blueprintjs/core";
import { Text } from "preact-i18n";
import { TopSoftkeyConfig } from "./top-softkey-config";

const PhoneConfigView = ({ phone }) => (
  <Card elevation={3}>
    <H5>
      {phone.name} ({phone.number})
      <Button icon="duplicate" onClick={() => {} /*company.copyConfig.bind(null, id)*/}>
        <Text id="copy" />
      </Button>
    </H5>
    <Divider />
    {phone.topSoftkeys.map((softkey) => (
      <TopSoftkeyConfig
        softkey={softkey}
      />
    ))}
  </Card>
);

export const PhoneConfig = PhoneConfigView;
