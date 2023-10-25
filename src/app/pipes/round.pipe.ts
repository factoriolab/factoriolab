import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';
import { DisplayService } from '~/services';

/** Used in tooltips / data pages to do a simple round on numeric values */
@Pipe({ name: 'round' })
export class RoundPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: Rational): string {
    return this.displaySvc.round(value);
  }
}
