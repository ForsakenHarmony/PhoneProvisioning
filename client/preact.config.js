const webpack = require('webpack');
const path = require('path');

export default (config, env) => {
  const alias = config.resolve.alias;
  const babel = config.module.rules[0];
  const babelConf = babel.options;

  alias.preact = "preact";
  alias.react = "preact";
  alias["react-dom"] = "preact";
  alias.ceviche = "preact";

  config.entry.bundle = path.resolve(__dirname, './src/index');
  config.resolve.extensions.unshift('.mjs');

  babel.test = /\.m?jsx?$/;
  babel.type = 'javascript/auto';

  babelConf.plugins = babelConf.plugins.filter(n => !n.includes('hot-loader'));

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({NODE_ENV: env.isProd ? 'production' : 'development'}),
    }),
  );

  babelConf.plugins[3] = [babelConf.plugins[3], { loose: true }];

  if (!env.isProd) {
    config.devServer.proxy = {
      '/api': {
        target: 'http://localhost:4000',
        ws: true
      }
    };
  }
}