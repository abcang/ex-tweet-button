"use strict";

/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const PATHS = require("./paths");

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      background: PATHS.src + "/background.ts",
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    devtool: argv.mode === "production" ? false : "source-map",
  });

module.exports = config;
