import IconsRenderer from './IconsRenderer';
import IconsUpdater from './IconsUpdater';

import IconsPaletteProvider from './IconsPaletteProvider';
import IconsContextPadProvider from './IconsContextPadProvider';
import IconsReplaceMenuProvider from './IconsReplaceMenuProvider';

export default {
  __init__: [
    'iconsRenderer',
    'iconsUpdater',
    'iconsPaletteProvider',
    'iconsContextPadProvider',
    'iconsReplaceMenuProvider'
  ],
  iconsRenderer: [ 'type', IconsRenderer ],
  iconsUpdater: [ 'type', IconsUpdater ],
  iconsPaletteProvider: [ 'type', IconsPaletteProvider ],
  iconsContextPadProvider: [ 'type', IconsContextPadProvider ],
  iconsReplaceMenuProvider: [ 'type', IconsReplaceMenuProvider ]
};