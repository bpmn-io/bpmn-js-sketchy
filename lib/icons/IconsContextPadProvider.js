import {
  assign
} from 'min-dash';

import {
  insertCSS
} from './IconsHelper';

import {
  HouseIcon,
  JunctionExclusiveIcon,
  HappyIcon,
  BellIcon
} from './_icons';

/**
 * A iconic palette provider for BPMN 2.0 elements.
 */
export default function IconsContextPadProvider(contextPad) {
  contextPad.registerProvider(700, this);
}

IconsContextPadProvider.$inject = [
  'contextPad'
];


IconsContextPadProvider.prototype.getContextPadEntries = function(element) {

  const entryToImageMap = {
    'append.intermediate-event': BellIcon,
    'append.end-event': HappyIcon,
    'append.gateway': JunctionExclusiveIcon,
    'append.append-task': HouseIcon
  };

  return function(entries) {

    return Object.keys(entries).reduce(function(newEntries, key) {

      var entry = entries[key];
      var imageUrl = entryToImageMap[key];

      if (imageUrl === null) {
        entry = null;
      }

      if (imageUrl) {
        entry = assign({}, entry, {
          className: 'djs-kah-context-pad-icon',
          imageUrl: imageUrl
        });
      }

      if (entry) {
        newEntries[key] = entry;
      }

      return newEntries;
    }, {});
  };

};


// helpers ///////////////

insertCSS('IconsContextPadProvider.css', '.djs-kah-context-pad-icon img { max-width: 20px !important; margin: 1px }');