import TestContainer from 'mocha-test-container-support';

import { expect } from 'chai';

import {
  insertCSS
} from 'bpmn-js/test/helper';

import diagramCSS from 'diagram-js/assets/diagram-js.css';
import bpmnFontCSS from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-font.css', bpmnFontCSS);

insertCSS('test-container.css', `
  .test-container {
    display: flex;
    flex-direction: column;
  }

  .test-content-container {
    flex: 1;
  }
`);

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


  it('should import process', async function() {

    var modeler = new Modeler({
      container: container,
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

    const {
      warnings
    } = await modeler.importXML(processXML);

    expect(warnings).to.have.length(0);
  });

});