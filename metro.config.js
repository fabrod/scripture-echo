// Metro config — adds .db so the bundled scripture.db can be require()'d
// as an asset for expo-sqlite's SQLiteProvider assetSource.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (!config.resolver.assetExts.includes('db')) {
  config.resolver.assetExts.push('db');
}

module.exports = config;
