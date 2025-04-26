//@ts-check

"use strict";

const path = require("path");
const TerserPlugin = require("terser-webpack-plugin"); // Dùng để giảm kích thước file build
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // Dọn sạch thư mục dist trước khi build
const nodeExternals = require("webpack-node-externals"); // Tự động loại trừ tất cả các mô-đun node_modules

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: "node", // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: "none", // Tối ưu hóa mã nguồn khi build
  entry: "./src/extension.ts", // Entry point của extension
  output: {
    path: path.resolve(__dirname, "dist"), // Thư mục đầu ra
    filename: "extension.js", // Tên tệp đã build
    libraryTarget: "commonjs2", // Sử dụng cho các mô-đun Node.js
  },
  externals: [
    { vscode: "commonjs vscode" }, // Chỉ định rằng `vscode` là mô-đun external
    nodeExternals(),
  ],
  resolve: {
    extensions: [".ts", ".js"], // Hỗ trợ các tệp TypeScript và JavaScript
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true, // Giảm thời gian build
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: true, // Thu nhỏ tệp bằng Terser
    minimizer: [
      new TerserPlugin({
        extractComments: false, // Không tạo file .LICENSE.txt
        terserOptions: {
          compress: {
            drop_console: true, // Loại bỏ console.log
            drop_debugger: true, // Loại bỏ debugger
          },
        },
      }),
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // Xóa thư mục dist trước khi build
  ],
  infrastructureLogging: {
    level: "warn", // Hiển thị cảnh báo trong console
  },
  stats: "errors-only", // Chỉ hiển thị lỗi trong quá trình build
};

module.exports = [extensionConfig];
