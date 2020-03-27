import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

import {
  EvilIcon,
  RocketIcon,
  FlowerIcon,
  HouseIcon,
  SmartHomeIcon,
  JunctionAndIcon,
  JunctionExclusiveIcon,
  JunctionAndJoinIcon,
  JunctionExclusiveJoinIcon,
  CurvesIcon,
  HappyIcon,
  WallClockIcon,
  DiscountIcon,
  BellIcon
} from './_icons';

import {
  isTypedEvent,
  getSemantic
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  append as svgAppend,
  create as svgCreate
} from 'tiny-svg';


export default function IconsRenderer(config, eventBus, textRenderer) {
  BaseRenderer.call(this, eventBus, 1500);

  this.canRender = function(element) {

    if (is(element, 'bpmn:SubProcess')) {
      return false;
    }

    return isAny(
      element, [
        'bpmn:Activity',
        'bpmn:Event',
        'bpmn:Gateway'
      ]
    );
  };


  this.drawShape = function(parentGfx, element) {

    if (element.labelTarget) {
      return;
    }

    var url = this.getIconUrl(element);

    if (!url) {
      return;
    }

    var gfx = svgCreate('image', {
      x: 0,
      y: 0,
      width: element.width,
      height: element.height,
      href: url
    });

    svgAppend(parentGfx, gfx);

    return gfx;
  };


  this.getIconUrl = function(element) {

    if (is(element, 'bpmn:StartEvent')) {
      return RocketIcon;
    }

    if (is(element, 'bpmn:ServiceTask')) {
      return SmartHomeIcon;
    }

    if (is(element, 'bpmn:BusinessRuleTask')) {
      return DiscountIcon;
    }

    if (is(element, 'bpmn:Activity')) {
      return HouseIcon;
    }

    if (is(element, 'bpmn:EndEvent')) {

      if (isTypedEvent(getSemantic(element), 'bpmn:TerminateEventDefinition')) {
        return EvilIcon;
      } else {
        return HappyIcon;
      }
    }

    if (is(element, 'bpmn:StartEvent')) {
      return RocketIcon;
    }

    if (is(element, 'bpmn:BoundaryEvent')) {
      return FlowerIcon;
    }

    if (is(element, 'bpmn:IntermediateCatchEvent')) {
      return WallClockIcon;
    }

    if (is(element, 'bpmn:IntermediateThrowEvent')) {
      return BellIcon;
    }

    if (is(element, 'bpmn:ParallelGateway')) {
      return element.incoming.length > 1 ? JunctionAndJoinIcon : JunctionAndIcon;
    }

    if (is(element, 'bpmn:ExclusiveGateway')) {
      return element.incoming.length > 1 ? JunctionExclusiveJoinIcon : JunctionExclusiveIcon;
    }

    if (is(element, 'bpmn:Gateway')) {
      return CurvesIcon;
    }
  };
}

inherits(IconsRenderer, BaseRenderer);

IconsRenderer.$inject = [ 'config.bpmnRenderer', 'eventBus', 'textRenderer' ];