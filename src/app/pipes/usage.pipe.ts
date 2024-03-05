import { inject, Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';
import { DisplayService } from '~/services';

/** Used in tooltips / data pages to do a simple round on power usage values */
@Pipe({ name: 'usage' })
export class UsagePipe implements PipeTransform {
  displaySvc = inject(DisplayService);

  transform(value: Rational | string | number): string {
    return this.displaySvc.usage(value);
  }
}
