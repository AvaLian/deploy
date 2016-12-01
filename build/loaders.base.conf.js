const path = require('path');
var utils = require('./utils');
var config = require('../config');

const env = process.env.NODE_ENV;
// check env & config/index.js to decide weither to enable CSS Sourcemaps for the
// various preprocessor loaders added to vue-loader at the end of this file
const cssSourceMapDev = (env === 'development' && config.dev.cssSourceMap);
const cssSourceMapProd = (env === 'production' && config.build.productionSourceMap);
const useCssSourceMap = cssSourceMapDev || cssSourceMapProd;

module.exports = {
  options: {
    vue: {
      postcss: [
        require('autoprefixer')({
          browsers: ['last 2 versions']
        })
      ],
      loaders: utils.cssLoaders({ sourceMap: useCssSourceMap })
    },
    sassLoader: {
      includePaths: [path.resolve(__dirname, '..', 'src', 'sass')]
    }
  }
}