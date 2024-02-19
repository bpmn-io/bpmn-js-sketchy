/* eslint-env node */
const suite = 'test/SketchyRendererSpec.js';

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(karma) {
  karma.set({

    frameworks: [
      'mocha',
      'chai',
      'webpack'
    ],

    files: [
      suite,
      { pattern: 'demo/*', included: false },
      { pattern: 'test/style.css', included: false }
    ],

    preprocessors: {
      [ suite ]: [ 'webpack' ]
    },

    reporters: [ 'progress' ],

    browsers: [ 'ChromeHeadless' ],

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(bpmn|xml|css)$/,
            type: 'asset/source'
          }
        ]
      },
      devtool: 'eval-source-map'
    }
  });
};