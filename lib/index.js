import SketchyRenderer from './SketchyRenderer';

import IconsModule from './icons';

export default {
  __depends__: [
    IconsModule
  ],
  __init__: [
    'bpmnRenderer'
  ],
  bpmnRenderer: [ 'type', SketchyRenderer ]
};