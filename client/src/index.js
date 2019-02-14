import "./style/index.css";
import { h, render } from 'preact';
import 'preact/debug';

const elem = document.createElement('main');
document.body.prepend(elem);

const init = () => {
  const { App } = require("./components/app");
  render(h(App, {}), elem);
};

if (module.hot) module.hot.accept(".", init);

init();

