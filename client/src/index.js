import "./style/index.css";
// import { h, render } from 'preact';
import { options } from 'preact';
// import 'preact/debug';
import { App } from "./components/app";

// const elem = document.createElement('main');
// document.body.prepend(elem);
//
// const init = () => {
//   const { App } = require("./components/app");
//   render(h(App, {}), elem);
// };
//
// if (module.hot) module.hot.accept(".", init);
//
// init();

window.addEventListener("unhandledrejection", event => {
  console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
});

function hook(name) {
  const old = options[name];
  options[name] = (...args) => {
    console.log(`[preact:${name}]`, ...args);
    old && old(...args);
  };
}

hook("diff");
hook("diffed");
hook("commit");
hook("render");

export default App;
