import "./style/index.css";
import { App } from "./components/app";

window.addEventListener("unhandledrejection", event => {
  console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
});

export default App;
