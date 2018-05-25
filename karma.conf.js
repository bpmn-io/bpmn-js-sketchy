module.exports = function(karma) {
  karma.set({

    frameworks: [ 'browserify', 'mocha', 'chai' ],

    files: [
      'test/*Spec.js'
    ],

    preprocessors: {
      'test/*Spec.js': [ 'browserify' ]
    },

    reporters: [ 'progress' ],

    browsers: [ 'Chrome' ],

    singleRun: true,
    autoWatch: false,

    // browserify configuration
    browserify: {
      transform: [
        [ 'babelify', {
          global: true
        } ],
        [ 'stringify', {
          global: true,
          extensions: [
            '.bpmn',
            '.xml',
            '.css'
          ]
        } ]
      ],
      debug: true
    }
  });
};