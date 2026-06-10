// Reanimated 4 / Worklets: do NOT add a plugin here manually.
// babel-preset-expo (SDK 54+) injects react-native-worklets/plugin automatically.
// Adding it by hand causes a duplicate-plugin crash on launch.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
