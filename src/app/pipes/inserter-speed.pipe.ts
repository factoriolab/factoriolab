import { Pipe, PipeTransform } from '@angular/core';

import { ItemId } from '~/models/enum/item-id';
import { InserterData, InserterSpeed } from '~/models/inserter-data';
import { Rational } from '~/models/rational';
import { Settings } from '~/models/settings/settings';

@Pipe({ name: 'inserterSpeed', standalone: true })
export class InserterSpeedPipe implements PipeTransform {
  transform(
    value: Rational | undefined,
    settings: Settings,
  ): InserterSpeed | null {
    if (value != null) {
      const inserter = InserterData[settings.inserterTarget][
        settings.inserterCapacity
      ]?.find((d) => d.value.gt(value) || d.id === ItemId.BulkInserter);

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
