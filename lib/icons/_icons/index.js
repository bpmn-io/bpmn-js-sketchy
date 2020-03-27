import EvilSVG from './001-evil.svg';
import RocketSVG from './012-rocket.svg';
import FlowerSVG from './002-flower.svg';
import HouseSVG from './003-house.svg';
import DiscountSVG from './004-discount.svg';
import RealEstateSVG from './005-real-estate.svg';
import SmartHomeSVG from './006-smart-home.svg';
import JunctionAndSVG from './011-junction-and.svg';
import JunctionAndJoinSVG from './011-junction-and-join.svg';
import JunctionExclusiveSVG from './011-junction-xor.svg';
import JunctionExclusiveJoinSVG from './011-junction-xor-join.svg';
import IntersectionSVG from './011-intersection.svg';
import HappySVG from './008-happy.svg';
import WallClockSVG from './009-wall-clock.svg';
import TurnSVG from './010-turn.svg';
import CurvesSVG from './013-curves.svg';
import BellSVG from './014-bell.svg';


function makeURL(svg) {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const EvilIcon = makeURL(EvilSVG);
const RocketIcon = makeURL(RocketSVG);
const FlowerIcon = makeURL(FlowerSVG);
const HouseIcon = makeURL(HouseSVG);
const DiscountIcon = makeURL(DiscountSVG);
const RealEstateIcon = makeURL(RealEstateSVG);
const SmartHomeIcon = makeURL(SmartHomeSVG);
const JunctionAndIcon = makeURL(JunctionAndSVG);
const JunctionAndJoinIcon = makeURL(JunctionAndJoinSVG);
const JunctionExclusiveIcon = makeURL(JunctionExclusiveSVG);
const JunctionExclusiveJoinIcon = makeURL(JunctionExclusiveJoinSVG);
const IntersectionIcon = makeURL(IntersectionSVG);
const HappyIcon = makeURL(HappySVG);
const WallClockIcon = makeURL(WallClockSVG);
const TurnIcon = makeURL(TurnSVG);
const CurvesIcon = makeURL(CurvesSVG);
const BellIcon = makeURL(BellSVG);


export {
  EvilIcon,
  RocketIcon,
  FlowerIcon,
  HouseIcon,
  DiscountIcon,
  RealEstateIcon,
  SmartHomeIcon,
  JunctionAndIcon,
  JunctionExclusiveIcon,
  JunctionAndJoinIcon,
  JunctionExclusiveJoinIcon,
  IntersectionIcon,
  HappyIcon,
  WallClockIcon,
  TurnIcon,
  CurvesIcon,
  BellIcon
};