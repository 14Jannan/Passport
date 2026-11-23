module.exports = {
  presets: ['babel-preset-expo'],
  // Metro's Babel preset needs this transform for Zod's ESM namespace exports.
  plugins: ['@babel/plugin-transform-export-namespace-from'],
};
