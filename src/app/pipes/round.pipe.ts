import { inject, Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models/rational';
import { DisplayService } from '~/services/display.service';

/** Used in tooltips / data pages to do a simple round on numeric values */
@Pipe({ name: 'round', standalone: true })
export class RoundPipe implements PipeTransform {
  displaySvc = inject(DisplayService);

  transform(value: Rational | string | number): string {
    return this.displaySvc.round(value);
  }
}
