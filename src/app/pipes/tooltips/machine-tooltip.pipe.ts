import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset, Game } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'machineTooltip' })
export class MachineTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService,
  ) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const machine = item?.machine;

    if (item == null || machine == null) return '';

    let html = item.name + '\n<small>';
    const tableRows: [string, string][] = [];
    if (machine.speed && data.game !== Game.CaptainOfIndustry) {
      tableRows.push([
        this.translateSvc.instant('data.craftingSpeed'),
        this.displaySvc.round(machine.speed),
      ]);
    }

    if (machine.modules && data.game === Game.Factorio) {
      tableRows.push([
        this.translateSvc.instant('data.modules'),
        machine.modules.toString(),
      ]);
    }

    if (machine.disallowedEffects) {
      tableRows.push([
        this.translateSvc.instant('data.disallowedEffects'),
        machine.disallowedEffects.join(', '),
      ]);
    }

    if (machine.type) {
      tableRows.push([
        this.translateSvc.instant('data.energySource'),
        machine.type,
      ]);
    }

    if (machine.fuelCategories) {
      tableRows.push([
        this.translateSvc.instant('data.fuelCategories'),
        machine.fuelCategories.join(', '),
      ]);
    }
    if (machine.usage?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.energyConsumption'),
        this.displaySvc.power(machine.usage),
      ]);
    }

    if (machine.drain?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.energyDrain'),
        this.displaySvc.power(machine.drain),
      ]);
    }

    if (machine.pollution?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.pollution'),
        this.displaySvc.round(machine.pollution) + '/m',
      ]);
    }

    if (machine.silo) {
      tableRows.push([
        this.translateSvc.instant('data.rocketPartsRequired'),
        this.displaySvc.round(machine.silo.parts),
      ]);
      tableRows.push([
        this.translateSvc.instant('data.rocketLaunchTime'),
        this.displaySvc.round(machine.silo.launch) + 's',
      ]);
    }

    html += this.displaySvc.table(tableRows);

    if (machine.consumption) {
      html +=
        '<div class="d-flex align-items-center justify-content-center flex-wrap mt-2">';
      for (const key of Object.keys(machine.consumption)) {
        html += this.displaySvc.icon(
          key,
          this.displaySvc.round(machine.consumption[key]),
        );
      }
      html += '</div>';
    }

    html += '</small>';

    return html;
  }
}
