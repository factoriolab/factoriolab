import { Pipe, PipeTransform } from '@angular/core';

import {
  InserterData,
  InserterSpeed,
  ItemId,
  Rational,
  SettingsComplete,
} from '~/models';

@Pipe({ name: 'inserterSpeed', standalone: true })
export class InserterSpeedPipe implements PipeTransform {
  transform(
    value: Rational | undefined,
    settings: SettingsComplete,
  ): InserterSpeed | null {
    if (value != null) {
      const inserter = InserterData[settings.inserterTarget][
        settings.inserterCapacity
      ]?.find((d) => d.value.gt(value) || d.id === ItemId.StackInserter);

      if (inserter == null) {
        // Should be impossible due to stack inserter fallback
        return null;
      }

      return {
        id: inserter.id,
        value: value.div(inserter.value),
      };
    }
    return null;
  }
}
