import { TooltipType } from '~/components/tooltip/tooltip-type';
import { IconType } from '~/data/icon-type';
import { Rational } from '~/rational/rational';

export interface TotalValue {
  total: Rational;
  iconType: IconType;
  tooltipType: TooltipType;
}
