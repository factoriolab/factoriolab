import { Directive } from '@angular/core';

import { TooltipType } from '~/components/tooltip/tooltip-type';
import { Rational } from '~/rational/rational';
import { ColumnSettings } from '~/state/preferences/columns-state';

export interface TotalCellsContext {
  col: ColumnSettings;
  totals: Record<string, Rational>;
  type: TooltipType;
}

@Directive({ selector: 'ng-template[labTotalCells]' })
export class TotalCells {
  static ngTemplateContextGuard(
    _: TotalCells,
    ctx: unknown,
  ): ctx is TotalCellsContext {
    return true;
  }
}
