import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/rational/rational';

@Pipe({ name: 'inserterStack' })
export class InserterStackPipe implements PipeTransform {
  transform(
    effects: {
      value: Rational;
      category?: string;
    }[],
  ): string {
    return effects
      .map((eff) => {
        let result = `+${eff.value.toString()}`;
        if (eff.category) result += ` (${eff.category})`;
        return result;
      })
      .join(', ');
  }
}
