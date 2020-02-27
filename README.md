# bpmn-js-sketchy

A sketchy renderer for [bpmn-js](https://github.com/bpmn-io/bpmn-js).

[__:arrow_right: Try it out__](https://cdn.statically.io/gh/bpmn-io/bpmn-js-sketchy/v0.5.0/demo/index.html).

![sketchy renderer at work](docs/screenshot.png)

## Usage

Extend bpmn-js with the sketchy renderer module:

```javascript
import modeler from 'bpmn-js/lib/Modeler';

const modeler = new Modeler({
  // ...
  additionalModules: [ sketchyRendererModule ]
});
```

For the full sketchy experience, you must configure bpmn-js to use a hand drawn font, for example [Nothing You Could Do](https://fonts.google.com/specimen/Nothing+You+Could+Do?selection.family=Nothing+You+Could+Do).

Check out [the demo](./demo) or [this test](test/SketchyRendererSpec.js#L42) for more information.

__To view sketchified diagrams you must have the font installed on your computer.__


## Licence

MIT