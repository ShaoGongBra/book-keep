/* eslint-disable import/no-commonjs */
const path = require("path")
const fs = require("fs")

const appRoot = path.join(__dirname, "..")

const getPlugins = () =>
  fs
    .readdirSync(path.join(appRoot, "plugins"))
    .map((pluginFile) => path.join(appRoot, "plugins", pluginFile))

module.exports = {
  appRoot,
  getPlugins,
}
