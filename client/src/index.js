import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "blueprint-css/dist/blueprint.css";
import {
  FocusStyleManager,
} from "@blueprintjs/core";
import { App } from "./components/app";

FocusStyleManager.onlyShowFocusOnTabs();

export default App;

