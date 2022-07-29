import { Pipe, PipeTransform } from '@angular/core';

import { DisplayRate, displayRateLabel } from '~/models';

@Pipe({ name: 'displayRateLabel' })
export class DisplayRateLabelPipe implements PipeTransform {
  transform(value: DisplayRate | undefined): string {
    if (value != null) {
      return displayRateLabel[value];
    } else {
      return '';
    }
  }
}
