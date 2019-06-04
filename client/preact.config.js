const webpack = require('webpack');

export default (config, env) => {
  // console.log(config.module);
  // const babel = config.module.rules[0];
  // const babelConf = babel.options;

  // config.plugins.push(
  //   new webpack.DefinePlugin({
  //     'process.env': JSON.stringify({NODE_ENV: env.isProd ? 'production' : 'development'}),
  //   }),
  // );

  if (!env.isProd) {
    config.devServer.proxy = {
      '/api': {
        target: 'http://localhost:4000',
        ws: true
      }
    };
  }
}
