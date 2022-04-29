import { Pipe, PipeTransform } from '@angular/core';

import { DisplayRate, DisplayRateLabel } from '~/models';

@Pipe({ name: 'displayRateLabel' })
export class DisplayRateLabelPipe implements PipeTransform {
  transform(value: DisplayRate | undefined): string {
    if (value != null) {
      return DisplayRateLabel[value];
    } else {
      return '';
    }
  }
}
