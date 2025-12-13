import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inserterStack' })
export class InserterStackPipe implements PipeTransform {
  transform(
    effects: {
      value: number;
      category?: string;
    }[],
  ): string {
    return effects
      .map((eff) => {
        let result = `+${eff.value}`;
        if (eff.category) result += ` (${eff.category})`;
        return result;
      })
      .join(', ');
  }
}
