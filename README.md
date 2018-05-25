# bpmn-js-sketchy

A sketchy renderer for [bpmn-js](https://github.com/bpmn-io/bpmn-js).

![foo](docs/screenshot.png)

## Usage

Extend bpmn-js with the sketchy renderer module:

```javascript
import modeler from 'bpmn-js/lib/Modeler';

const modeler = new Modeler({
  // ...
  additionalModules: [ sketchyRendererModule ]
});
```

Check out [this test](test/SketchyRendererSpec.js#L40) for more information.

__Note:__ You need to include [babel-polyfill](https://babeljs.io/docs/usage/polyfill/) when using the sketchy renderer.

## Licence

MIT