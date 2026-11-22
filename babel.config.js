module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Metro's Babel preset needs this transform for Zod's ESM namespace exports.
  plugins: ['@babel/plugin-transform-export-namespace-from'],
};
