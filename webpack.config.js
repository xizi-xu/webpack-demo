const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const webpack = require('webpack');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const validate = require('webpack-validator');

const tasks = require('./lib/tasks');

// Load *package.json* so we can use `dependencies` from there
const pkg = require('./package.json');

const PATHS = {
  react: path.join(__dirname, 'node_modules/react/dist/react.min.js'),
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  style: path.join(__dirname, 'app/main.css')
};

const common = {
  // Entry accepts a path or an object of entries.
  // We'll be using the latter form given it's
  // convenient with more complex configurations.
  entry: {
    app: PATHS.app,
    style: PATHS.style
  },
  output: {
    path: PATHS.build,
    // Output using the entry name
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};
var config;

// Detect how npm is run and branch based on that
switch(process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common,
      {
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        }
      },
      tasks.clean(PATHS.build),
      tasks.setEnvironment({
        key: 'process.env.NODE_ENV',
        value: 'production'
      }),
      tasks.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      tasks.extractCSS(PATHS.app),
      tasks.minify()
    );
  case 'start':
  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map',
        plugins: [
          new webpack.HotModuleReplacementPlugin(),
          new NpmInstallPlugin({
            save: true // --save
          })
        ]
      },
      tasks.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      }),
      tasks.setupCSS(PATHS.app),
      tasks.dontParse({
        name: 'react',
        path: PATHS.react
      })
    );
}

module.exports = validate(config);
