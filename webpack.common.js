const path = require("path");
const fs = require("fs");

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
    // ...fileEntryMap,
    index: "index.js",
    "test-support": "test-support.js",
  },
  output: {
    publicPath: "/",
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    // libraryTarget: "umd",
    // library: "bt-components",
  },
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  // devServer: {
  //   contentBase: "./dist",
  //   allowedHosts: ["local.beliantech.com"]
  // },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  optimization: {
    minimize: process.env.NODE_ENV === "development" ? false : true,
    minimizer: [new TerserPlugin()],
  },
  // externals: [/^lodash\/.+$/],
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: "babel-loader",
      //   },
      // },
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
            loader: "css-loader",
          },
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
    new CopyWebpackPlugin([{ from: "README.md" }]),
    new CopyWebpackPlugin([
      {
        from: "src",
        transformPath(targetPath, absolutePath) {
          return targetPath.replace(/src\//, "");
        },
        globOptions: {
          ignore: ["src/bt-utils.css"],
        },
      },
    ]),
  ],
  devServer: {
    contentBase: "./dist",
  },
};
