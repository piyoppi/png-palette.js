const webpack = require("webpack");
const path = require('path');

const babelPlugins = [
  "@babel/plugin-transform-async-to-generator",
  "@babel/plugin-transform-runtime",
  "@babel/plugin-proposal-object-rest-spread"
]

module.exports = {
  mode: 'development',
  entry: {
    png_conv: './src/png_conv.js',
    entry: './examples/entry.js',
  },
  output: {
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      PngConv: './src/png_conv.js'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/, 
        exclude: file => (
          /node_modules/.test(file)
        ),
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: babelPlugins,
              presets: ['@babel/preset-env'],
            }
          }
        ]
      },
    ],
  },
  node: {
    fs: "empty"
  },
  resolve: {
    modules: [__dirname, "node_modules"],
  }
}
