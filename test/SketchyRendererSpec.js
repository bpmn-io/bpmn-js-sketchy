import 'regenerator-runtime/runtime';

import TestContainer from 'mocha-test-container-support';

import {
  insertCSS
} from 'bpmn-js/test/helper';

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-embedded.css', require('bpmn-font/dist/css/bpmn-embedded.css'));

import Modeler from 'bpmn-js/lib/Modeler';

import sketchyRendererModule from '../';

import processXML from './pizza-collaboration.bpmn';

function appendStylesheet(url, done) {
  var stylesheet = document.createElement('link');

  stylesheet.href = url;
  stylesheet.rel = 'stylesheet';
  stylesheet.type = 'text/css';
  stylesheet.onload = done;

  document.getElementsByTagName('head')[0].appendChild(stylesheet);
}


describe('SketchyRenderer', function() {

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should import process', function(done) {

    // wait for font to load before rendering
    appendStylesheet('https://fonts.googleapis.com/css?family=Nothing+You+Could+Do', function() {
      var modeler = new Modeler({
        container: container,
        keyboard: {
          bindTo: document
        },
        textRenderer: {
          defaultStyle: {
            fontFamily: '"Nothing You Could Do"',
            fontWeight: 'bold',
            fontSize: 12,
            lineHeight: 16
          },
          externalStyle: {
            fontSize: 12,
            lineHeight: 16
          }
        },
        additionalModules: [ sketchyRendererModule ]
      });

      modeler.importXML(processXML, function(err, warnings) {
        expect(err).to.not.exist;
        expect(warnings).to.have.length(0);

        done();
      });
    });
  });

});