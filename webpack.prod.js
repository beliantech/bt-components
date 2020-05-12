const path = require("path");
const fs = require("fs");

// const webpack = require("webpack");
// const HtmlWebpackPlugin = require("html-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const CopyWebpackPlugin = require("copy-webpack-plugin");

const fileEntryMap = {};
fs.readdirSync("./src/components").forEach((filename) => {
  const pathToFile = `./src/components/${filename}`;
  const stat = fs.statSync(pathToFile);
  if (stat.isFile()) {
    fileEntryMap[path.parse(filename).name] = pathToFile;
  }
});

console.log("entryMap", fileEntryMap);

module.exports = {
  entry: {
    ...fileEntryMap,
  },
  output: {
    publicPath: "/",
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  // devServer: {
  //   contentBase: "./dist",
  //   allowedHosts: ["local.beliantech.com"]
  // },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(png|jpg|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "postcss-loader",
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{ from: "package.json" }]),
  ],
};
