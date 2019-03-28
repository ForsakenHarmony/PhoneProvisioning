import { IntlProvider } from "./i18n";
import { Component } from "preact";
import { Config } from "./config";
import { definition } from "../constants";

import { createClient, Provider } from "@pql/boost";

const client = createClient(`ws://${window.location.host}/api/graphql`);

export class App extends Component {
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
