import {
  assign
} from 'min-dash';

import {
  insertCSS
} from './IconsHelper';

import {
  RocketIcon,
  HouseIcon,
  JunctionExclusiveIcon,
  HappyIcon,
  BellIcon
} from './_icons';

/**
 * A iconic palette provider for BPMN 2.0 elements.
 */
export default function IconsPaletteProvider(palette) {
  palette.registerProvider(700, this);
}

IconsPaletteProvider.$inject = [
  'palette'
];


IconsPaletteProvider.prototype.getPaletteEntries = function(element) {

  const entryToImageMap = {
    'create.start-event':  RocketIcon,
    'create.intermediate-event': BellIcon,
    'create.end-event': HappyIcon,
    'create.exclusive-gateway': JunctionExclusiveIcon,
    'create.task': HouseIcon,
    'create.data-object': null,
    'create.data-store': null,
    'create.subprocess-expanded': null,
    'create.participant-expanded': null,
    'create.group': null
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
          className: 'djs-kah-palette-icon',
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

insertCSS('IconsPaletteProvider.css', '.djs-kah-palette-icon img { max-width: 32px !important; margin: 7px }');