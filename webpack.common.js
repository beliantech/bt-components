const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// const CopyWebpackPlugin = require("copy-webpack-plugin");

const fileEntryMap = {};
fs.readdirSync("./src/components").forEach(filename => {
  const pathToFile = `./src/components/${filename}`;
  const stat = fs.statSync(pathToFile);
  if (stat.isFile()) {
    fileEntryMap[path.parse(filename).name] = pathToFile;
  }
});

console.log("entryMap", fileEntryMap);

module.exports = {
  entry: {
    ...fileEntryMap
  },
  output: {
    publicPath: "/",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  mode: "development", // TODO: Override in PRODUCTION
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    allowedHosts: ["local.beliantech.com"]
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "postcss-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "KanRails",
      hash: true,
      inject: false,
      template: "./index.html",
      chunksSortMode: "none", // https://github.com/vuejs/vue-cli/issues/1669
      environment: process.env.NODE_ENV
    })
    // new CopyWebpackPlugin([{ from: "src/static/public" }]),
  ]
};
