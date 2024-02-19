/* global BpmnJS, download, BpmnJSSketchy, FileDrops */

let file = { name: 'diagram.bpmn' };

// modeler instance
const bpmnEditor = new BpmnJS({
  container: '#canvas',
  keyboard: {
    bindTo: document.querySelector('body')
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
    BpmnJSSketchy
  ]
});

/**
 * Save diagram contents and print them to the console.
 */
function downloadSVG() {
  bpmnEditor.saveSVG()
    .then(({ svg }) => {
      return download(svg, file.name + '.svg', 'application/xml');
    })
    .catch(err => {
      return console.error('Failed to save SVG', err);
    });
}

function downloadBPMN() {
  bpmnEditor.saveXML({ format: true })
    .then(({ xml }) => {
      return download(xml, file.name, 'application/xml');
    })
    .catch(err => {
      console.error('Failed to save XML', err);
    });
}

/**
 * Open diagram in our modeler instance.
 *
 * @param {String} bpmnXML diagram to display
 */
function openDiagram(bpmnXML) {

  // import diagram
  bpmnEditor.importXML(bpmnXML)
    .then(() => {

      // access modeler components
      const canvas = bpmnEditor.get('canvas');

      // zoom to fit full viewport
      canvas.zoom('fit-viewport');
    }).catch(err => {

      console.error('could not import BPMN 2.0 diagram', err);
    });
}

// wire save button
document.querySelector('#download-svg').addEventListener('click', downloadSVG);

// wire save button
document.querySelector('#download-bpmn').addEventListener('click', downloadBPMN);

const dropHandler = FileDrops('Drop a BPMN diagram', function(files) {

  if (files.length) {
    file = files[0];

    openDiagram(file.contents);
  }
});

document.querySelector('body').addEventListener('dragover', dropHandler);

window.addEventListener('load', function() {

  const defaultDiagramUrl = 'https://cdn.statically.io/gh/bpmn-io/bpmn-js-sketchy/a891af1fb3c2e6f6b7a85e5e1c562f941b9db24f/test/pizza-collaboration.bpmn';

  // load external diagram file via AJAX and open it
  fetch(defaultDiagramUrl).then(r => r.text()).then(openDiagram);

});