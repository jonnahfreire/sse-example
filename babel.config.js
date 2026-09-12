module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    [
      "@babel/preset-typescript",
      { allowDeclareFields: true, allowNamespaces: true, allExtensions: true },
    ],
  ],
  plugins: [["@babel/plugin-proposal-decorators", { legacy: true }]],
};
