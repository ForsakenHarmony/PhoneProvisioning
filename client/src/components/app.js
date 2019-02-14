import { IntlProvider } from "preact-i18n";
import { Config } from "./config";
import { definition } from "../constants";

import { Client } from "@pql/client";
import { SocketTransport } from "@pql/websocket";
import { Provider } from "@pql/hooks";
import { cache, DefaultStorage } from "@pql/cache";

const transport = new SocketTransport({
  // "ws://localhost:4000/graphql"
  url: `ws://${window.location.host}/api/graphql`
});

const client = new Client(transport, [cache(new DefaultStorage())]);

export class App {
  render() {
    return (
      <IntlProvider definition={definition}>
        <Provider value={client}>
          <Config />
        </Provider>
      </IntlProvider>
    );
  }
}
