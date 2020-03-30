import IconsRenderer from './IconsRenderer';
import IconsUpdater from './IconsUpdater';
import IconsPaletteProvider from './IconsPaletteProvider';

export default {
  __init__: [
    'iconsRenderer',
    'iconsUpdater',,
    'iconsPaletteProvider',
  ],
  iconsRenderer: [ 'type', IconsRenderer ],
  iconsUpdater: [ 'type', IconsUpdater ],
  iconsPaletteProvider: [ 'type', IconsPaletteProvider ]
};