import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'beaconTooltip' })
export class BeaconTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService
  ) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const beacon = item?.beacon;

    if (item == null || beacon == null) return '';

    let html = item.name + '\n<small>';

    const tableRows: [string, string][] = [
      [
        this.translateSvc.instant('tooltip.effectivity'),
        this.displaySvc.round(beacon.effectivity),
      ],
      [this.translateSvc.instant('tooltip.modules'), beacon.modules.toString()],
      [this.translateSvc.instant('tooltip.range'), beacon.range.toString()],
    ];

    if (beacon.type) {
      tableRows.push([
        this.translateSvc.instant('tooltip.energyType'),
        beacon.type,
      ]);
    }

    if (beacon.category) {
      tableRows.push([
        this.translateSvc.instant('tooltip.fuelCategory'),
        beacon.category,
      ]);
    }

    if (beacon.usage) {
      tableRows.push([
        this.translateSvc.instant('tooltip.energyUsage'),
        this.displaySvc.power(beacon.usage),
      ]);
    }

    html += this.displaySvc.table(tableRows);

    html += '</small>';

    return html;
  }
}
