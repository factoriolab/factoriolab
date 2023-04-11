import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset, Game } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'machineTooltip' })
export class MachineTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService
  ) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const machine = item?.machine;

    if (item == null || machine == null) return '';

    let html = item.name + '\n<small>';
    const tableRows: [string, string][] = [
      [this.translateSvc.instant('tooltip.energyType'), machine.type],
      [
        this.translateSvc.instant('tooltip.energyUsage'),
        this.displaySvc.power(machine.usage),
      ],
    ];
    if (data.game !== Game.CaptainOfIndustry) {
      tableRows.push([
        this.translateSvc.instant('tooltip.craftingSpeed'),
        this.displaySvc.round(machine.speed),
      ]);
    }

    if (machine.modules && data.game === Game.Factorio) {
      tableRows.push([
        this.translateSvc.instant('tooltip.modules'),
        machine.modules.toString(),
      ]);
    }

    if (machine.disallowedEffects) {
      tableRows.push([
        this.translateSvc.instant('tooltip.disallowedEffects'),
        machine.disallowedEffects.join(', '),
      ]);
    }

    if (machine.category) {
      tableRows.push([
        this.translateSvc.instant('tooltip.fuelCategory'),
        machine.category,
      ]);
    }

    if (machine.drain?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('tooltip.drain'),
        this.displaySvc.power(machine.drain),
      ]);
    }

    if (machine.pollution?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('tooltip.pollution'),
        this.displaySvc.round(machine.pollution) + '/m',
      ]);
    }

    if (machine.silo) {
      tableRows.push([
        this.translateSvc.instant('tooltip.rocketPartsRequired'),
        this.displaySvc.round(machine.silo.parts),
      ]);
      tableRows.push([
        this.translateSvc.instant('tooltip.launchTime'),
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
          this.displaySvc.round(machine.consumption[key])
        );
      }
      html += '</div>';
    }

    html += '</small>';

    return html;
  }
}
