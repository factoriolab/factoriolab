import { Pipe, PipeTransform } from '@angular/core';

import { Step } from '~/models';

/**
 * Does not do any actual checking, mainly used to restore typing inside
 * PrimeNG templates which cast to `any`
 */
@Pipe({ name: 'asStep' })
export class AsStepPipe implements PipeTransform {
  transform(value: Step): Step {
    return value as Step;
  }
}
