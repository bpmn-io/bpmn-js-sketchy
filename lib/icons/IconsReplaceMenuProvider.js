import {
  SmartHomeIcon,
  HouseIcon,
  DiscountIcon,
  BellIcon,
  RocketIcon,
  WallClockIcon,
  JunctionExclusiveIcon,
  JunctionAndIcon,
  EvilIcon,
  HappyIcon
} from './_icons';

import {
  insertCSS
} from './IconsHelper';

import {
  assign
} from 'min-dash';


export default function IconsReplaceMenuProvider(popupMenu) {
  popupMenu.registerProvider('bpmn-replace', 700, this);
}

IconsReplaceMenuProvider.$inject = [ 'popupMenu' ];

IconsReplaceMenuProvider.prototype.getPopupMenuEntries = function(element) {

  const entryToImageMap = {
    'replace-with-task': HouseIcon,
    'replace-with-service-task': SmartHomeIcon,
    'replace-with-rule-task': DiscountIcon,
    'replace-with-none-start': RocketIcon,
    'replace-with-none-intermediate-throw': BellIcon,
    'replace-with-none-intermediate-throwing': BellIcon,
    'replace-with-timer-intermediate-catch': WallClockIcon,
    'replace-with-exclusive-gateway': JunctionExclusiveIcon,
    'replace-with-parallel-gateway': JunctionAndIcon,
    'replace-with-terminate-end': EvilIcon,
    'replace-with-none-end': HappyIcon
  };

  return function(entries) {

    return Object.keys(entries).reduce(function(newEntries, key) {

      var entry = entries[key];
      var imageUrl = entryToImageMap[key];

      if (!imageUrl) {
        entry = null;
      }

      if (imageUrl) {
        entry = assign({}, entry, {
          className: 'djs-kah-replace-menu-pad-icon',
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

IconsReplaceMenuProvider.prototype.getPopupMenuHeaderEntries = function(element) {

  return function(entries) {

    // no header entries (!)
    return {};
  };
};



// helpers ///////////////

insertCSS('IconsReplaceMenuProvider.css',
  '.djs-kah-replace-menu-pad-icon img { max-width: 20px !important; margin: 1px }' +
  '.djs-kah-replace-menu-pad-icon { display: flex; flex-direction: row; align-items: center; }'
);