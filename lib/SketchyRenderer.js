import inherits from 'inherits-browser';

import rough from 'roughjs/bin/rough';

import {
  isObject,
  assign,
  forEach
} from 'min-dash';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  getLabel
} from 'bpmn-js/lib/features/label-editing/LabelUtil';

import {
  isExpanded,
  isEventSubProcess
} from 'bpmn-js/lib/util/DiUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
  isTypedEvent,
  isThrowEvent,
  isCollection,
  getDi,
  getSemantic,
  getCirclePath,
  getRoundRectPath,
  getDiamondPath,
  getRectPath,
  getFillColor,
  getStrokeColor,
  black
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  query as domQuery
} from 'min-dom';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';

import {
  rotate,
  transform,
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

import Ids from 'ids';

var RENDERER_IDS = new Ids();

var TASK_BORDER_RADIUS = 10;
var INNER_OUTER_DIST = 7;

var DEFAULT_FILL_OPACITY = .95,
    HIGH_FILL_OPACITY = .35;


export default function BpmnRenderer(
    config, eventBus, styles, pathMap,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config.bpmnRenderer && config.bpmnRenderer.defaultFillColor,
      defaultStrokeColor = config.bpmnRenderer && config.bpmnRenderer.defaultStrokeColor;

  var rc = rough.svg(canvas._svg);

  var rendererId = RENDERER_IDS.next();

  var markers = {};

  function shapeStyle(attrs) {
    return styles.computeStyle(attrs, {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      stroke: black,
      strokeWidth: 2,
      fill: 'white'
    });
  }

  function lineStyle(attrs) {
    return styles.computeStyle(attrs, [ 'no-fill' ], {
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      stroke: black,
      strokeWidth: 2
    });
  }

  function addMarker(id, options) {
    var {
      ref = { x: 0, y: 0 },
      scale = 1,
      element
    } = options;

    var marker = svgCreate('marker', {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    svgAppend(marker, element);

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {

    // only allow characters and numbers
    return str.replace(/[^0-9a-zA-z]+/g, '_');
  }

  function marker(type, fill, stroke) {
    var id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(id, type, fill, stroke) {

    if (type === 'sequenceflow-end') {
      var sequenceflowEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15 Z',
        ...shapeStyle({
          fill: stroke,
          stroke: stroke,
          strokeWidth: 1
        })
      });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'messageflow-start') {
      var messageflowStart = svgCreate('circle', {
        cx: 6,
        cy: 6,
        r: 3.5,
        ...shapeStyle({
          fill: fill,
          stroke: stroke,
          strokeWidth: 1,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: messageflowStart,
        ref: { x: 6, y: 6 }
      });
    }

    if (type === 'messageflow-end') {
      var messageflowEnd = svgCreate('path', {
        d: 'm 1 5 l 0 -3 l 7 3 l -7 3 z',
        ...shapeStyle({
          fill: fill,
          stroke: stroke,
          strokeWidth: 1,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: messageflowEnd,
        ref: { x: 8.5, y: 5 }
      });
    }

    if (type === 'association-start') {
      var associationStart = svgCreate('path', {
        d: 'M 11 5 L 1 10 L 11 15',
        ...lineStyle({
          stroke: stroke,
          strokeWidth: 1.5,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: associationStart,
        ref: { x: 1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'association-end') {
      var associationEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15',
        ...lineStyle({
          stroke: stroke,
          strokeWidth: 1.5,

          // fix for safari / chrome / firefox bug not correctly
          // resetting stroke dash array
          strokeDasharray: [ 10000, 1 ]
        })
      });

      addMarker(id, {
        element: associationEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-flow-marker') {
      var conditionalFlowMarker = svgCreate('path', {
        d: 'M 0 10 L 8 6 L 16 10 L 8 14 Z',
        ...shapeStyle({
          fill: fill,
          stroke: stroke
        })
      });

      addMarker(id, {
        element: conditionalFlowMarker,
        ref: { x: -1, y: 10 },
        scale: 0.5
      });
    }

    if (type === 'conditional-default-flow-marker') {
      var defaultFlowMarker = svgCreate('path', {
        d: 'M 6 4 L 10 16',
        ...shapeStyle({
          stroke: stroke
        })
      });

      addMarker(id, {
        element: defaultFlowMarker,
        ref: { x: 0, y: 10 },
        scale: 0.5
      });
    }
  }


  function drawCircle(parentGfx, width, height, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = shapeStyle({
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white',
      fillStyle: 'solid',
      roughness: 0.5,
      ...attrs
    });

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    var cx = width / 2,
        cy = height / 2;

    var circle = rc.circle(cx, cy, Math.round((width + height) / 2 - offset), attrs);

    svgAppend(parentGfx, circle);

    return circle;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = shapeStyle({
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white',
      fillStyle: 'solid',
      ...attrs
    });

    var rect = rc.rectangle(offset, offset, width - offset * 2, height - offset * 2, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawDiamond(parentGfx, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [ { x: x_2, y: 0 }, { x: width, y: y_2 }, { x: x_2, y: height }, { x: 0, y: y_2 } ];

    var pointsArray = points.map(function(point) {
      return [ point.x, point.y ];
    });

    attrs = shapeStyle({
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white',
      ...attrs
    });

    var polygon = rc.polygon(pointsArray, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  /**
   * @param {SVGElement} parentGfx
   * @param {Point[]} waypoints
   * @param {any} attrs
   * @param {number} [radius]
   *
   * @return {SVGElement}
   */
  function drawLine(parentGfx, waypoints, attrs, radius) {
    attrs = lineStyle({
      ...attrs,
      roughness: .5
    });

    var line = rc.linearPath(waypoints.map(function(waypoint) {
      return [ waypoint.x, waypoint.y ];
    }), attrs);

    svgAppend(parentGfx, line);

    svgAttr(line, attrs);

    return line;
  }

  /**
   * @param {SVGElement} parentGfx
   * @param {Point[]} waypoints
   * @param {any} attrs
   *
   * @return {SVGElement}
   */
  function drawConnectionSegments(parentGfx, waypoints, attrs) {
    return drawLine(parentGfx, waypoints, attrs, 5);
  }

  function drawPath(parentGfx, d, attrs, hints) {

    attrs = lineStyle({
      strokeWidth: 2,
      stroke: 'black',
      fillStyle: 'solid',
      ...attrs
    });

    var path = rc.path(d, attrs);

    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function drawMarker(type, parentGfx, path, attrs) {
    if (!attrs) {
      attrs = {};
    }

    return drawPath(parentGfx, path, assign({ 'data-marker': type }, assign(attrs, {
      roughness: 0.5
    })));
  }

  function as(type) {
    return function(parentGfx, element) {
      return handlers[type](parentGfx, element);
    };
  }

  function renderer(type) {
    return handlers[type];
  }

  function renderEventContent(element, parentGfx) {

    var event = getSemantic(element);
    var isThrowing = isThrowEvent(event);

    if (isTypedEvent(event, 'bpmn:MessageEventDefinition')) {
      return renderer('bpmn:MessageEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TimerEventDefinition')) {
      return renderer('bpmn:TimerEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ConditionalEventDefinition')) {
      return renderer('bpmn:ConditionalEventDefinition')(parentGfx, element);
    }

    if (isTypedEvent(event, 'bpmn:SignalEventDefinition')) {
      return renderer('bpmn:SignalEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: false })) {
      return renderer('bpmn:MultipleEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition') &&
      isTypedEvent(event, 'bpmn:TerminateEventDefinition', { parallelMultiple: true })) {
      return renderer('bpmn:ParallelMultipleEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:EscalationEventDefinition')) {
      return renderer('bpmn:EscalationEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:LinkEventDefinition')) {
      return renderer('bpmn:LinkEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:ErrorEventDefinition')) {
      return renderer('bpmn:ErrorEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CancelEventDefinition')) {
      return renderer('bpmn:CancelEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:CompensateEventDefinition')) {
      return renderer('bpmn:CompensateEventDefinition')(parentGfx, element, isThrowing);
    }

    if (isTypedEvent(event, 'bpmn:TerminateEventDefinition')) {
      return renderer('bpmn:TerminateEventDefinition')(parentGfx, element, isThrowing);
    }

    return null;
  }

  function renderLabel(parentGfx, label, options) {
    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');
    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getStrokeColor(element, defaultStrokeColor)
      }
    });
  }

  function renderExternalLabel(parentGfx, element) {

    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    var target = element.labelTarget;

    var align = target.y > element.y ? 'center-bottom' : 'center-top';

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      align: align,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: getStrokeColor(element, defaultStrokeColor)
        }
      )
    });
  }

  function renderLaneLabel(parentGfx, text, element) {
    var textBox = renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.height
      },
      align: 'center-middle',
      style: {
        fill: getStrokeColor(element, defaultStrokeColor)
      }
    });

    var top = -1 * element.height;

    transform(textBox, 0, -top, 270);
  }


  var handlers = this.handlers = {
    'bpmn:Event': function(parentGfx, element, attrs) {

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      return drawCircle(parentGfx, element.width, element.height, attrs);
    },
    'bpmn:StartEvent': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.5
      };

      var semantic = getSemantic(element);

      var circle = renderer('bpmn:Event')(parentGfx, element, attrs);

      if (!semantic.isInterrupting) {
        svgAttr(circle, {
          strokeDasharray: '6, 6',
          strokeLinecap: 'round'
        });
      }

      renderEventContent(element, parentGfx);

      return circle;
    },
    'bpmn:MessageEventDefinition': function(parentGfx, element, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_MESSAGE', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.235,
          my: 0.315
        }
      });

      var fill = isThrowing ? getStrokeColor(element, defaultStrokeColor) : getFillColor(element, defaultFillColor);
      var stroke = isThrowing ? getFillColor(element, defaultFillColor) : getStrokeColor(element, defaultStrokeColor);

      var messagePath = drawPath(parentGfx, pathData, {
        strokeWidth: isThrowing ? 2 : 1,
        fill: fill,
        stroke: stroke
      });

      return messagePath;
    },
    'bpmn:TimerEventDefinition': function(parentGfx, element) {
      var circle = drawCircle(parentGfx, element.width, element.height, 0.2 * element.height, {
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      var pathData = pathMap.getScaledPath('EVENT_TIMER_WH', {
        xScaleFactor: 0.75,
        yScaleFactor: 0.75,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.5,
          my: 0.5
        }
      });

      drawPath(parentGfx, pathData, {
        strokeWidth: 2,
        strokeLinecap: 'square',
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.2
      });

      for (var i = 0;i < 12;i++) {

        var linePathData = pathMap.getScaledPath('EVENT_TIMER_LINE', {
          xScaleFactor: 0.75,
          yScaleFactor: 0.75,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.5,
            my: 0.5
          }
        });

        var width = element.width / 2;
        var height = element.height / 2;

        drawPath(parentGfx, linePathData, {
          strokeWidth: 1,
          strokeLinecap: 'square',
          transform: 'rotate(' + (i * 30) + ',' + height + ',' + width + ')',
          stroke: getStrokeColor(element, defaultStrokeColor),
          roughness: 0.75
        });
      }

      return circle;
    },
    'bpmn:EscalationEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_ESCALATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:ConditionalEventDefinition': function(parentGfx, event) {
      var pathData = pathMap.getScaledPath('EVENT_CONDITIONAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.222
        }
      });

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        stroke: getStrokeColor(event, defaultStrokeColor),
        roughness: 0.5
      });
    },
    'bpmn:LinkEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_LINK', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.57,
          my: 0.263
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:ErrorEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_ERROR', {
        xScaleFactor: 1.1,
        yScaleFactor: 1.1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.2,
          my: 0.722
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:CancelEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_CANCEL_45', {
        xScaleFactor: 1.0,
        yScaleFactor: 1.0,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.638,
          my: -0.055
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      var path = drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });

      rotate(path, 45);

      return path;
    },
    'bpmn:CompensateEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.22,
          my: 0.5
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:SignalEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_SIGNAL', {
        xScaleFactor: 0.9,
        yScaleFactor: 0.9,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.5,
          my: 0.2
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill,
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:MultipleEventDefinition': function(parentGfx, event, isThrowing) {
      var pathData = pathMap.getScaledPath('EVENT_MULTIPLE', {
        xScaleFactor: 1.1,
        yScaleFactor: 1.1,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.222,
          my: 0.36
        }
      });

      var fill = isThrowing ? getStrokeColor(event, defaultStrokeColor) : 'none';

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: fill
      });
    },
    'bpmn:ParallelMultipleEventDefinition': function(parentGfx, event) {
      var pathData = pathMap.getScaledPath('EVENT_PARALLEL_MULTIPLE', {
        xScaleFactor: 1.2,
        yScaleFactor: 1.2,
        containerWidth: event.width,
        containerHeight: event.height,
        position: {
          mx: 0.458,
          my: 0.194
        }
      });

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(event, defaultStrokeColor),
        stroke: getStrokeColor(event, defaultStrokeColor)
      });
    },
    'bpmn:EndEvent': function(parentGfx, element) {
      var circle = renderer('bpmn:Event')(parentGfx, element, {
        strokeWidth: 4,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      renderEventContent(element, parentGfx, true);

      return circle;
    },
    'bpmn:TerminateEventDefinition': function(parentGfx, element) {
      var circle = drawCircle(parentGfx, element.width, element.height, 14, {
        strokeWidth: 4,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        fillStyle: 'solid'
      });

      return circle;
    },
    'bpmn:IntermediateEvent': function(parentGfx, element) {
      var outer = renderer('bpmn:Event')(parentGfx, element, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      /* inner */ drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, {
        strokeWidth: 1,
        fill: getFillColor(element, 'none'),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:IntermediateCatchEvent': as('bpmn:IntermediateEvent'),
    'bpmn:IntermediateThrowEvent': as('bpmn:IntermediateEvent'),

    'bpmn:Activity': function(parentGfx, element, attrs) {

      attrs = attrs || {};

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var pathData = getRoundRectPath(assign({}, element, { x: 0, y: 0 }), TASK_BORDER_RADIUS);

      return drawPath(parentGfx, pathData, assign(attrs, {
        roughness: 0.4
      }));
    },

    'bpmn:Task': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      attachTaskMarkers(parentGfx, element);

      return rect;
    },
    'bpmn:ServiceTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathDataBG = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 12,
          y: 18
        }
      });

      /* service bg */ drawPath(parentGfx, pathDataBG, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        simplification: 0.5,
        roughness: 0.1
      });

      var fillPathData = pathMap.getScaledPath('TASK_TYPE_SERVICE_FILL', {
        abspos: {
          x: 17.2,
          y: 18
        }
      });

      /* service fill */ drawPath(parentGfx, fillPathData, {
        strokeWidth: 0,
        fill: getFillColor(element, defaultFillColor),
        simplification: 0.5,
        roughness: 0.1
      });

      var pathData = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
        abspos: {
          x: 17,
          y: 22
        }
      });

      /* service */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        simplification: 0.5,
        roughness: 0.1
      });

      return task;
    },
    'bpmn:UserTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var x = 15;
      var y = 12;

      var pathData = pathMap.getScaledPath('TASK_TYPE_USER_1', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.2
      });

      var pathData2 = pathMap.getScaledPath('TASK_TYPE_USER_2', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user2 path */ drawPath(parentGfx, pathData2, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.2
      });

      var pathData3 = pathMap.getScaledPath('TASK_TYPE_USER_3', {
        abspos: {
          x: x,
          y: y
        }
      });

      /* user3 path */ drawPath(parentGfx, pathData3, {
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.2
      });

      return task;
    },
    'bpmn:ManualTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_MANUAL', {
        abspos: {
          x: 17,
          y: 15
        }
      });

      /* manual path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor),
        simplification: 0.9
      });

      return task;
    },
    'bpmn:SendTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: 21,
        containerHeight: 14,
        position: {
          mx: 0.285,
          my: 0.357
        }
      });

      /* send path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getFillColor(element, defaultFillColor)
      });

      return task;
    },
    'bpmn:ReceiveTask' : function(parentGfx, element) {
      var semantic = getSemantic(element);

      var task = renderer('bpmn:Task')(parentGfx, element);
      var pathData;

      if (semantic.instantiate) {
        drawCircle(parentGfx, 28, 28, 20 * 0.22, { strokeWidth: 1 });

        pathData = pathMap.getScaledPath('TASK_TYPE_INSTANTIATING_SEND', {
          abspos: {
            x: 7.77,
            y: 9.52
          }
        });
      } else {

        pathData = pathMap.getScaledPath('TASK_TYPE_SEND', {
          xScaleFactor: 0.9,
          yScaleFactor: 0.9,
          containerWidth: 21,
          containerHeight: 14,
          position: {
            mx: 0.3,
            my: 0.4
          }
        });
      }

      /* receive path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return task;
    },
    'bpmn:ScriptTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var pathData = pathMap.getScaledPath('TASK_TYPE_SCRIPT', {
        abspos: {
          x: 15,
          y: 20
        }
      });

      /* script path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.3
      });

      return task;
    },
    'bpmn:BusinessRuleTask': function(parentGfx, element) {
      var task = renderer('bpmn:Task')(parentGfx, element);

      var headerPathData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_HEADER', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      drawPath(parentGfx, headerPathData, {
        roughness: 0.5,
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      var headerData = pathMap.getScaledPath('TASK_TYPE_BUSINESS_RULE_MAIN', {
        abspos: {
          x: 8,
          y: 8
        }
      });

      drawPath(parentGfx, headerData, {
        roughness: 0.5,
        strokeWidth: 1,
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return task;
    },
    'bpmn:SubProcess': function(parentGfx, element, attrs) {
      attrs = assign({
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs);

      var rect = renderer('bpmn:Activity')(parentGfx, element, attrs);

      var expanded = isExpanded(element);

      if (isEventSubProcess(element)) {
        svgAttr(rect, {
          strokeDasharray: '1,2'
        });
      }

      renderEmbeddedLabel(parentGfx, element, expanded ? 'center-top' : 'center-middle');

      if (expanded) {
        attachTaskMarkers(parentGfx, element);
      } else {
        attachTaskMarkers(parentGfx, element, [ 'SubProcessMarker' ]);
      }

      return rect;
    },
    'bpmn:AdHocSubProcess': function(parentGfx, element) {
      return renderer('bpmn:SubProcess')(parentGfx, element);
    },
    'bpmn:Transaction': function(parentGfx, element) {
      var outer = renderer('bpmn:SubProcess')(parentGfx, element);

      var innerAttrs = styles.style([ 'no-fill', 'no-events' ], {
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      /* inner path */
      var pathData = getRoundRectPath({
        x: INNER_OUTER_DIST,
        y: INNER_OUTER_DIST,
        width: element.width - 2 * INNER_OUTER_DIST,
        height: element.height - 2 * INNER_OUTER_DIST
      }, TASK_BORDER_RADIUS);

      drawPath(parentGfx, pathData, assign(innerAttrs, {
        roughness: 0.4
      }));

      return outer;
    },
    'bpmn:CallActivity': function(parentGfx, element) {
      return renderer('bpmn:SubProcess')(parentGfx, element, {
        strokeWidth: 5
      });
    },
    'bpmn:Participant': function(parentGfx, element) {

      var attrs = {
        fillOpacity: DEFAULT_FILL_OPACITY,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      var lane = renderer('bpmn:Lane')(parentGfx, element, attrs);

      var expandedPool = isExpanded(element);

      if (expandedPool) {
        drawLine(parentGfx, [
          { x: 30, y: 0 },
          { x: 30, y: element.height }
        ], {
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
        var text = getSemantic(element).name;
        renderLaneLabel(parentGfx, text, element);
      } else {

        // Collapsed pool draw text inline
        var text2 = getSemantic(element).name;
        renderLabel(parentGfx, text2, {
          box: element, align: 'center-middle',
          style: {
            fill: getStrokeColor(element, defaultStrokeColor)
          }
        });
      }

      var participantMultiplicity = !!(getSemantic(element).participantMultiplicity);

      if (participantMultiplicity) {
        renderer('ParticipantMultiplicityMarker')(parentGfx, element);
      }

      return lane;
    },
    'bpmn:Lane': function(parentGfx, element, attrs) {
      var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: HIGH_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.3
      }, attrs));

      var semantic = getSemantic(element);

      if (semantic.$type === 'bpmn:Lane') {
        var text = semantic.name;
        renderLaneLabel(parentGfx, text, element);
      }

      return rect;
    },
    'bpmn:InclusiveGateway': function(parentGfx, element) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element);

      /* circle path */
      drawCircle(parentGfx, element.width, element.height, element.height * 0.5, {
        strokeWidth: 2.5,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return diamond;
    },
    'bpmn:ExclusiveGateway': function(parentGfx, element) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element);

      var pathData = pathMap.getScaledPath('GATEWAY_EXCLUSIVE', {
        xScaleFactor: 0.4,
        yScaleFactor: 0.4,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.32,
          my: 0.3
        }
      });

      if ((getDi(element).isMarkerVisible)) {
        drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getStrokeColor(element, defaultStrokeColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      }

      return diamond;
    },
    'bpmn:ComplexGateway': function(parentGfx, element) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element);

      var pathData = pathMap.getScaledPath('GATEWAY_COMPLEX', {
        xScaleFactor: 0.5,
        yScaleFactor:0.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.26
        }
      });

      /* complex path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return diamond;
    },
    'bpmn:ParallelGateway': function(parentGfx, element) {
      var diamond = renderer('bpmn:Gateway')(parentGfx, element);

      var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
        xScaleFactor: 0.6,
        yScaleFactor:0.6,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.46,
          my: 0.2
        }
      });

      /* parallel path */ drawPath(parentGfx, pathData, {
        strokeWidth: 1,
        fill: getStrokeColor(element, defaultStrokeColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return diamond;
    },
    'bpmn:EventBasedGateway': function(parentGfx, element) {

      var semantic = getSemantic(element);

      var diamond = renderer('bpmn:Gateway')(parentGfx, element);

      /* outer circle path */ drawCircle(parentGfx, element.width, element.height, element.height * 0.4, {
        strokeWidth: 1,
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      var type = semantic.eventGatewayType;
      var instantiate = !!semantic.instantiate;

      function drawEvent() {

        var pathData = pathMap.getScaledPath('GATEWAY_EVENT_BASED', {
          xScaleFactor: 0.18,
          yScaleFactor: 0.18,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.36,
            my: 0.44
          }
        });

        /* event path */ drawPath(parentGfx, pathData, {
          strokeWidth: 2,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      }

      if (type === 'Parallel') {

        var pathData = pathMap.getScaledPath('GATEWAY_PARALLEL', {
          xScaleFactor: 0.4,
          yScaleFactor:0.4,
          containerWidth: element.width,
          containerHeight: element.height,
          position: {
            mx: 0.474,
            my: 0.296
          }
        });

        drawPath(parentGfx, pathData, {
          strokeWidth: 1,
          fill: getFillColor(element, defaultFillColor),
          stroke: getStrokeColor(element, defaultStrokeColor)
        });
      } else if (type === 'Exclusive') {

        if (!instantiate) {
          drawCircle(parentGfx, element.width, element.height, element.height * 0.55, {
            strokeWidth: 1,
            fill: getFillColor(element, defaultFillColor),
            stroke: getStrokeColor(element, defaultStrokeColor)
          });
        }

        drawEvent();
      }


      return diamond;
    },
    'bpmn:Gateway': function(parentGfx, element) {
      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      return drawDiamond(parentGfx, element.width, element.height, attrs);
    },
    'bpmn:SequenceFlow': function(parentGfx, element) {
      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      var path = drawConnectionSegments(parentGfx, element.waypoints, {
        markerEnd: marker('sequenceflow-end', fill, stroke),
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeLinejoin: 'round',
        roughness: 0.5,
        bowing: 0
      });

      var sequenceFlow = getSemantic(element);

      var source;

      if (element.source) {
        source = element.source.businessObject;

        // conditional flow marker
        if (sequenceFlow.conditionExpression && source.$instanceOf('bpmn:Activity')) {
          svgAttr(path, {
            markerStart: marker('conditional-flow-marker', fill, stroke)
          });
        }

        // default marker
        if (source.default && (source.$instanceOf('bpmn:Gateway') || source.$instanceOf('bpmn:Activity')) &&
            source.default === sequenceFlow) {
          svgAttr(path, {
            markerStart: marker('conditional-default-flow-marker', fill, stroke)
          });
        }
      }

      return path;
    },
    'bpmn:Association': function(parentGfx, element, attrs) {

      var semantic = getSemantic(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      attrs = assign({
        strokeDasharray: '1, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.5,
        bowing: 0
      }, attrs || {});

      if (semantic.associationDirection === 'One' ||
          semantic.associationDirection === 'Both') {
        attrs.markerEnd = marker('association-end', fill, stroke);
      }

      if (semantic.associationDirection === 'Both') {
        attrs.markerStart = marker('association-start', fill, stroke);
      }

      return drawLine(parentGfx, element.waypoints, attrs);
    },
    'bpmn:DataInputAssociation': function(parentGfx, element) {
      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      return renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: marker('association-end', fill, stroke)
      });
    },
    'bpmn:DataOutputAssociation': function(parentGfx, element) {
      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      return renderer('bpmn:Association')(parentGfx, element, {
        markerEnd: marker('association-end', fill, stroke)
      });
    },
    'bpmn:MessageFlow': function(parentGfx, element) {

      var semantic = getSemantic(element),
          di = getDi(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      var path = drawConnectionSegments(parentGfx, element.waypoints, {
        markerEnd: marker('messageflow-end', fill, stroke),
        markerStart: marker('messageflow-start', fill, stroke),
        strokeDasharray: '10, 12',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '1.5px',
        stroke: getStrokeColor(element, defaultStrokeColor),
        roughness: 0.5,
        bowing: 0
      });

      if (semantic.messageRef) {
        var midPoint = path.getPointAtLength(path.getTotalLength() / 2);

        var markerPathData = pathMap.getScaledPath('MESSAGE_FLOW_MARKER', {
          abspos: {
            x: midPoint.x,
            y: midPoint.y
          }
        });

        var messageAttrs = { strokeWidth: 1 };

        if (di.messageVisibleKind === 'initiating') {
          messageAttrs.fill = 'white';
          messageAttrs.stroke = 'black';
        } else {
          messageAttrs.fill = '#888';
          messageAttrs.stroke = 'white';
        }

        drawPath(parentGfx, markerPathData, messageAttrs);
      }

      return path;
    },
    'bpmn:DataObject': function(parentGfx, element) {
      var pathData = pathMap.getScaledPath('DATA_OBJECT_PATH', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.474,
          my: 0.296
        }
      });

      var elementObject = drawPath(parentGfx, pathData, {
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      var semantic = getSemantic(element);

      if (isCollection(semantic)) {
        renderDataItemCollection(parentGfx, element);
      }

      return elementObject;
    },
    'bpmn:DataObjectReference': as('bpmn:DataObject'),
    'bpmn:DataInput': function(parentGfx, element) {

      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

      /* input arrow path */ drawPath(parentGfx, arrowPathData, { strokeWidth: 1 });

      return elementObject;
    },
    'bpmn:DataOutput': function(parentGfx, element) {
      var arrowPathData = pathMap.getRawPath('DATA_ARROW');

      // page
      var elementObject = renderer('bpmn:DataObject')(parentGfx, element);

      /* output arrow path */ drawPath(parentGfx, arrowPathData, {
        strokeWidth: 1,
        fill: 'black'
      });

      return elementObject;
    },
    'bpmn:DataStoreReference': function(parentGfx, element) {
      var DATA_STORE_PATH = pathMap.getScaledPath('DATA_STORE', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0,
          my: 0.133
        }
      });

      var elementStore = drawPath(parentGfx, DATA_STORE_PATH, {
        strokeWidth: 2,
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: DEFAULT_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      return elementStore;
    },
    'bpmn:BoundaryEvent': function(parentGfx, element) {

      var semantic = getSemantic(element),
          cancel = semantic.cancelActivity;

      var attrs = {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      // apply fillOpacity
      var outerAttrs = assign({}, attrs, {
        fillOpacity: 1,
        roughness: 0.5
      });

      // apply no-fill
      var innerAttrs = assign({}, attrs, {
        fill: 'none',
        roughness: 0.5
      });

      var outer = renderer('bpmn:Event')(parentGfx, element, outerAttrs);

      if (!cancel) {
        svgAttr(outer, {
          strokeDasharray: '6, 6',
          strokeLinecap: 'round'
        });
      }

      /* inner path */
      var inner = drawCircle(parentGfx, element.width, element.height, INNER_OUTER_DIST, innerAttrs);

      if (!cancel) {
        svgAttr(inner, {
          strokeDasharray: '6, 6',
          strokeLinecap: 'round'
        });
      }

      renderEventContent(element, parentGfx);

      return outer;
    },
    'bpmn:Group': function(parentGfx, element) {

      var pathData = getRoundRectPath(assign({}, element, { x: 0, y: 0 }), TASK_BORDER_RADIUS);

      return drawPath(parentGfx, pathData, {
        strokeWidth: 1.5,
        strokeDasharray: '8,6,1,6',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: getStrokeColor(element, defaultStrokeColor),
        fill: 'none',
        pointerEvents: 'none',
        roughness: 0.5,
        bowing: 0
      });
    },
    'label': function(parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    },
    'bpmn:TextAnnotation': function(parentGfx, element) {
      var style = {
        'fill': 'none',
        'stroke': 'none'
      };

      var textElement = drawRect(parentGfx, element.width, element.height, 0, 0, style);

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });
      drawPath(parentGfx, textPathData, {
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      var text = getSemantic(element).text || '';
      renderLabel(parentGfx, text, {
        box: element,
        align: 'left-top',
        padding: 5,
        style: {
          fill: getStrokeColor(element, defaultStrokeColor)
        }
      });

      return textElement;
    },
    'ParticipantMultiplicityMarker': function(parentGfx, element) {
      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      drawMarker('participant-multiplicity', parentGfx, markerPath);
    },
    'SubProcessMarker': function(parentGfx, element) {
      var markerRect = drawRect(parentGfx, 14, 14, 0, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });

      // Process marker is placed in the middle of the box
      // therefore fixed values can be used here
      translate(markerRect, element.width / 2 - 7.5, element.height - 20);

      var markerPath = pathMap.getScaledPath('MARKER_SUB_PROCESS', {
        xScaleFactor: 1.5,
        yScaleFactor: 1.5,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: (element.width / 2 - 7.5) / element.width,
          my: (element.height - 20) / element.height
        }
      });

      drawMarker('sub-process', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });
    },
    'ParallelMarker': function(parentGfx, element, position) {
      var markerPath = pathMap.getScaledPath('MARKER_PARALLEL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.parallel) / element.width),
          my: (element.height - 20) / element.height
        }
      });

      drawMarker('parallel', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });
    },
    'SequentialMarker': function(parentGfx, element, position) {
      var markerPath = pathMap.getScaledPath('MARKER_SEQUENTIAL', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.seq) / element.width),
          my: (element.height - 19) / element.height
        }
      });

      drawMarker('sequential', parentGfx, markerPath, {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });
    },
    'CompensationMarker': function(parentGfx, element, position) {
      var markerMath = pathMap.getScaledPath('MARKER_COMPENSATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.compensation) / element.width),
          my: (element.height - 13) / element.height
        }
      });

      drawMarker('compensation', parentGfx, markerMath, {
        strokeWidth: 1,
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      });
    },
    'LoopMarker': function(parentGfx, element, position) {
      var markerPath = pathMap.getScaledPath('MARKER_LOOP', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.loop) / element.width),
          my: (element.height - 7) / element.height
        }
      });

      drawMarker('loop', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'none',
        stroke: getStrokeColor(element, defaultStrokeColor),
        strokeLinecap: 'round',
        strokeMiterlimit: 0.5
      });
    },
    'AdhocMarker': function(parentGfx, element, position) {
      var markerPath = pathMap.getScaledPath('MARKER_ADHOC', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: ((element.width / 2 + position.adhoc) / element.width),
          my: (element.height - 15) / element.height
        }
      });

      drawMarker('adhoc', parentGfx, markerPath, {
        strokeWidth: 1,
        fill: 'black'
      });
    }
  };

  function attachTaskMarkers(parentGfx, element, taskMarkers) {
    var obj = getSemantic(element);

    var subprocess = taskMarkers && taskMarkers.indexOf('SubProcessMarker') !== -1;
    var position;

    if (subprocess) {
      position = {
        seq: -21,
        parallel: -22,
        compensation: -42,
        loop: -18,
        adhoc: 10
      };
    } else {
      position = {
        seq: -3,
        parallel: -6,
        compensation: -27,
        loop: 0,
        adhoc: 10
      };
    }

    forEach(taskMarkers, function(marker) {
      renderer(marker)(parentGfx, element, position);
    });

    if (obj.isForCompensation) {
      renderer('CompensationMarker')(parentGfx, element, position);
    }

    if (obj.$type === 'bpmn:AdHocSubProcess') {
      renderer('AdhocMarker')(parentGfx, element, position);
    }

    var loopCharacteristics = obj.loopCharacteristics,
        isSequential = loopCharacteristics && loopCharacteristics.isSequential;

    if (loopCharacteristics) {

      if (isSequential === undefined) {
        renderer('LoopMarker')(parentGfx, element, position);
      }

      if (isSequential === false) {
        renderer('ParallelMarker')(parentGfx, element, position);
      }

      if (isSequential === true) {
        renderer('SequentialMarker')(parentGfx, element, position);
      }
    }
  }

  function renderDataItemCollection(parentGfx, element) {

    var yPosition = (element.height - 16) / element.height;

    var pathData = pathMap.getScaledPath('DATA_OBJECT_COLLECTION_PATH', {
      xScaleFactor: 1,
      yScaleFactor: 1,
      containerWidth: element.width,
      containerHeight: element.height,
      position: {
        mx: 0.451,
        my: yPosition
      }
    });

    /* collection path */ drawPath(parentGfx, pathData, {
      strokeWidth: 2
    });
  }


  // extension API, use at your own risk
  this._drawPath = drawPath;

}


inherits(BpmnRenderer, BaseRenderer);

BpmnRenderer.$inject = [
  'config',
  'eventBus',
  'styles',
  'pathMap',
  'canvas',
  'textRenderer'
];


BpmnRenderer.prototype.canRender = function(element) {
  return is(element, 'bpmn:BaseElement');
};

BpmnRenderer.prototype.drawShape = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

BpmnRenderer.prototype.drawConnection = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

BpmnRenderer.prototype.getShapePath = function(element) {

  if (is(element, 'bpmn:Event')) {
    return getCirclePath(element);
  }

  if (is(element, 'bpmn:Activity')) {
    return getRoundRectPath(element, TASK_BORDER_RADIUS);
  }

  if (is(element, 'bpmn:Gateway')) {
    return getDiamondPath(element);
  }

  return getRectPath(element);
};
