// webpack plugins
// const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  // devtool: 'eval-source-map',
  entry: './src/index.js',
  output: {
    publicPath: '/static/build/',
    path: __dirname + '/build',
    filename: "bundle.[hash].js",

  },
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules']
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({use: 'css-loader'}),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['es2015']
        }
      },

      {
        test: /\.html$/,
        exclude: /node_modules/,
        loader: 'html-loader'
      },
      // {
      //   test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //   loader: "file-loader?limit=10000&mimetype=application/font-woff"
      // },
      // {
      //   test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      //   loader: "file-loader"
      // },

    ]
  },
  plugins: [
    new CleanWebpackPlugin(['./build', '../server/portal/templates/base.html'], { watch: true}),
    new ngAnnotatePlugin({add:true}),
    new LiveReloadPlugin(),
    new HtmlWebpackPlugin(
      {
        inject : false,
        template : '../server/portal/templates/base.j2',
        filename: '../../server/portal/templates/base.html',
      }
    ),
    new ExtractTextPlugin({
		  filename: "bundle.[hash].css"
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.[hash].js',
      minChunks (module) {
        return module.context &&
               module.context.indexOf('node_modules') >= 0;
      }
    }),
    new webpack.ProvidePlugin({    // <added>
       jQuery: 'jquery',
       $: 'jquery',
       jquery: 'jquery'   // </added>
   })
  ],

  externals: {
    _: '_',
    _: 'underscore',
    window: 'window',
  }
};
