import IconsRenderer from './IconsRenderer';
import IconsUpdater from './IconsUpdater';

export default {
  __init__: [
    'iconsRenderer',
    'iconsUpdater'
  ],
  iconsRenderer: [ 'type', IconsRenderer ],
  iconsUpdater: [ 'type', IconsUpdater ]
};