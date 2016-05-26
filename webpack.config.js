var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: {
    crawl_viewer: './js/crawl_viewer.js',
  },
  output: {
    path: __dirname,
    filename: '[name].js'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ["es2015", "react", "stage-0"],
        }
      }
    ]
  },
};
