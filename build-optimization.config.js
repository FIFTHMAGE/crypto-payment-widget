/** Build Optimization */
module.exports = {
  optimization: {
    minimize: true,
    splitChunks: { chunks: 'all', maxSize: 244000 },
    runtimeChunk: 'single',
    usedExports: true,
    sideEffects: false
  }
};

