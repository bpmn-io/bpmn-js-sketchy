# bpmn-js-sketchy

A sketchy renderer for [bpmn-js](https://github.com/bpmn-io/bpmn-js).

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

For the full sketchy experience, you must configure bpmn-js to use [a hand drawn font](https://fonts.google.com/specimen/Nothing+You+Could+Do?selection.family=Nothing+You+Could+Do).

Check out [the demo](./demo) or [this test](test/SketchyRendererSpec.js#L42) for more information.


## Licence

MIT