import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { TooltipType } from '~/components/tooltip/tooltip-type';

export interface Option<T = string> {
  label: string;
  value: T;
  icon?: string | IconDefinition;
  iconClass?: string;
  tooltip?: string;
  tooltipType?: TooltipType;
  disabled?: boolean;
}
