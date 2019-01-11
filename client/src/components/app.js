import { IntlProvider } from "preact-i18n";
import { Config } from "./config";
import { definition } from "../constants";

import { Client } from "@pql/client";
import { SocketTransport } from "@pql/websocket";
import { Provider } from "@pql/preact";

const transport = new SocketTransport({
  url: "ws://localhost:4000/graphql" // `ws://${window.location.host}/api/graphql`,
});

const client = new Client(transport);

export class App {
  render() {
    return (
      <IntlProvider definition={definition}>
        <Provider client={client}>
          <Config />
        </Provider>
      </IntlProvider>
    );
  }
}
