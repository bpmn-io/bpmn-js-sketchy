var suite = 'test/SketchyRendererSpec.js';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'mocha', 'chai' ],

    files: [
      suite
    ],

    preprocessors: {
      [ suite ]: [ 'webpack' ]
    },

    reporters: [ 'progress' ],

    browsers: [ 'Chrome' ],

    singleRun: true,
    autoWatch: false,

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(bpmn|xml|css)$/,
            use: 'raw-loader'
          }
        ]
      },
      devtool: 'eval-source-map'
    }
  });
};