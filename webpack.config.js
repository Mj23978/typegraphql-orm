const path = require("path")
const nodeExternals = require("webpack-node-externals")

module.exports = {
  mode: "development",
  target: "node",
  entry: {
    app: ["./src/index.ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src/")
    },
    extensions: [".ts", ".js"]
  },
  output: {
    path: path.resolve(__dirname, "lib/"),
    filename: "index.js"
  },
  externals: [nodeExternals()]
}