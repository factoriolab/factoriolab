import { Pipe, PipeTransform } from '@angular/core';

import { TooltipType } from '~/components/tooltip/tooltip-type';
import { Dataset } from '~/state/settings/dataset';

@Pipe({ name: 'totalTooltipType' })
export class TotalTooltipTypePipe implements PipeTransform {
  transform(value: string, type: TooltipType, data: Dataset): TooltipType {
    if (type === 'cargo-wagon' && data.cargoWagonRecord[value] == null)
      return 'fluid-wagon';
    return type;
  }
}
