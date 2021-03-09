const fs = require("fs");
const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.js"],
  webpackFinal: (config) => {
    const entries = [];
    fs.readdirSync("src/components").forEach((filename) => {
      const pathToFile = `src/components/${filename}`;

      const stat = fs.statSync(pathToFile);
      if (stat.isFile()) {
        const absolutePath = path.resolve("src/components", filename);
        entries.push(absolutePath);
      }
    });

    config.entry.push(...entries);

    config.resolve.modules.push(path.resolve(__dirname, "..", "src"));

    // Configure Storybook default .css test to ignore our code
    config.module.rules.forEach((rule) => {
      /* prettier-ignore */
      if (rule.test.toString() === /\.css$/.toString()) {
        rule.exclude = [path.resolve(__dirname, "../src")];
      }
    });

    // Configure .css test to process our code
    config.module.rules.push({
      test: /\.css$/,
      use: [
        { loader: "css-loader" },
        {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              path: path.resolve(__dirname, "../"),
            },
          },
        },
      ],
      include: [path.resolve(__dirname, "../src")],
    });

    // console.dir(config.module.rules);

    return config;
  },
};
