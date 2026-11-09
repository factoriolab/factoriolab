import { Pipe, PipeTransform } from '@angular/core';

import { IsPowerPipe } from '~/data/schema/item';
import { Option } from '~/option/option';
import { ObjectiveUnit } from '~/state/objectives/objective-unit';
import { spread } from '~/utils/object';

@Pipe({ name: 'itemUnitOptions' })
export class ItemUnitOptionsPipe implements PipeTransform {
  transform(
    itemId: string,
    options: Option<ObjectiveUnit>[],
  ): Option<ObjectiveUnit>[] {
    if (IsPowerPipe.transform(itemId))
      return options.map((o) =>
        o.value === ObjectiveUnit.Machines
          ? o
          : spread(o, { label: 'options.powerUnit.kW' }),
      );
    return options;
  }
}
