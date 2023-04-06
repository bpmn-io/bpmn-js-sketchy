import TestContainer from 'mocha-test-container-support';

import {
  insertCSS
} from 'bpmn-js/test/helper';

insertCSS('diagram-js.css', require('diagram-js/assets/diagram-js.css'));

insertCSS('bpmn-embedded.css', require('bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'));

import Modeler from 'bpmn-js/lib/Modeler';

import sketchyRendererModule from '../lib';

import processXML from './pizza-collaboration.bpmn';

function appendStylesheet(url) {

  return new Promise((resolve, reject) => {

    var stylesheet = document.createElement('link');

    stylesheet.href = url;
    stylesheet.rel = 'stylesheet';
    stylesheet.type = 'text/css';
    stylesheet.onload = resolve;
    stylesheet.onerror = reject;

    document.getElementsByTagName('head')[0].appendChild(stylesheet);
  });
}

function wait(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


describe('SketchyRenderer', function() {

  this.timeout(10000);

  before(async function() {
    await appendStylesheet('/base/test/style.css');

    await wait(2000);
  });


  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should import process', function(done) {

    var modeler = new Modeler({
      container: container,
      keyboard: {
        bindTo: document
      },
      textRenderer: {
        defaultStyle: {
          fontFamily: '"Virgil"',
          fontWeight: 'normal',
          fontSize: 16,
          lineHeight: 1.1
        },
        externalStyle: {
          fontSize: 15,
          lineHeight: 1.1
        }
      },
      additionalModules: [
        sketchyRendererModule
      ]
    });

    modeler.importXML(processXML, function(err, warnings) {
      expect(err).to.not.exist;
      expect(warnings).to.have.length(0);

      done();
    });
  });

});