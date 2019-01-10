const webpack = require('webpack');

export default (config, env) => {
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({NODE_ENV: env.isProd ? 'production' : 'development'}),
    }),
  );

  const babelConf = config.module.rules[0].options;
  babelConf.plugins[3] = [babelConf.plugins[3], { loose: true }];

  if (!env.isProd) {
    config.devServer.proxy = {
      '/api': {
        target: 'http://localhost:4000',
        pathRewrite: {'^/api' : ''}
      }
    };
  }
}