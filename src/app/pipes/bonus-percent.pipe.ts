import { inject, Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models/rational';
import { DisplayService } from '~/services/display.service';

/** Used in tooltips / data pages to format strings describing module effects */
@Pipe({ name: 'bonusPercent', standalone: true })
export class BonusPercentPipe implements PipeTransform {
  displaySvc = inject(DisplayService);

  transform(value: Rational): string {
    return this.displaySvc.toBonusPercent(value);
  }
}
