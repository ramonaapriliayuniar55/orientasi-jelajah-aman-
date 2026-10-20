const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Masukkan wasm ke assetExts, bukan sourceExts
config.resolver.assetExts.push('wasm');

module.exports = config;
