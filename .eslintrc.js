module.exports = {
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  env: {
    // 你的环境变量（包含多个预定义的全局变量）
    //
    // browser: true,
    // node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // 你的全局变量（设置为 false 表示它不允许被重新赋值）
    //
    // myGlobal: false
  },
  rules: {
    "react/jsx-one-expression-per-line": 0,
    "react/jsx-props-no-spreading": 0,
    "max-len": ["error", { code: 120 }],
    "@typescript-eslint/indent": 0,
    "operator-linebreak": 0,
    "object-curly-newline": 0,
    "implicit-arrow-linebreak": 0,
    "react/jsx-wrap-multilines": 0,
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
};
