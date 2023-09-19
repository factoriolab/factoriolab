import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { RawDataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'beaconTooltip' })
export class BeaconTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService,
  ) {}

  transform(value: string | null | undefined, data: RawDataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const beacon = item?.beacon;

    if (item == null || beacon == null) return '';

    let html = item.name + '\n<small>';

    const tableRows: [string, string][] = [
      [
        this.translateSvc.instant('data.efficiency'),
        this.displaySvc.round(beacon.effectivity),
      ],
      [this.translateSvc.instant('data.modules'), beacon.modules.toString()],
      [this.translateSvc.instant('data.range'), beacon.range.toString()],
    ];

    if (beacon.type != null) {
      tableRows.push([
        this.translateSvc.instant('data.energySource'),
        beacon.type,
      ]);
    }

    if (beacon.usage != null) {
      tableRows.push([
        this.translateSvc.instant('data.energyConsumption'),
        this.displaySvc.power(beacon.usage),
      ]);
    }

    if (beacon.disallowedEffects) {
      tableRows.push([
        this.translateSvc.instant('data.disallowedEffects'),
        beacon.disallowedEffects.join(', '),
      ]);
    }

    html += this.displaySvc.table(tableRows);

    html += '</small>';

    return html;
  }
}
