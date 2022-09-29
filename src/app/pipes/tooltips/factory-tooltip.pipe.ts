import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset, Game } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'factoryTooltip' })
export class FactoryTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService
  ) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const factory = item?.factory;

    if (item == null || factory == null) return '';

    let html = item.name + '\n<small>';
    const tableRows: [string, string][] = [];
    if (factory.speed && data.game !== Game.CaptainOfIndustry) {
      tableRows.push([
        this.translateSvc.instant('tooltip.craftingSpeed'),
        this.displaySvc.round(factory.speed),
      ]);
    }

    if (factory.modules && data.game === Game.Factorio) {
      tableRows.push([
        this.translateSvc.instant('tooltip.modules'),
        factory.modules.toString(),
      ]);
    }

    if (factory.disallowEffects) {
      tableRows.push([
        this.translateSvc.instant('tooltip.disallowEffects'),
        factory.disallowEffects.join(', '),
      ]);
    }

    if (factory.type) {
      tableRows.push([
        this.translateSvc.instant('tooltip.energyType'),
        factory.type,
      ]);
    }

    if (factory.category) {
      tableRows.push([
        this.translateSvc.instant('tooltip.fuelCategory'),
        factory.category,
      ]);
    }

    if (factory.usage?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('tooltip.energyUsage'),
        this.displaySvc.power(factory.usage),
      ]);
    }

    if (factory.drain?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('tooltip.drain'),
        this.displaySvc.power(factory.drain),
      ]);
    }

    if (factory.pollution?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('tooltip.pollution'),
        this.displaySvc.round(factory.pollution) + '/m',
      ]);
    }

    if (factory.silo) {
      tableRows.push([
        this.translateSvc.instant('tooltip.rocketPartsRequired'),
        this.displaySvc.round(factory.silo.parts),
      ]);
      tableRows.push([
        this.translateSvc.instant('tooltip.launchTime'),
        this.displaySvc.round(factory.silo.launch) + 's',
      ]);
    }

    html += this.displaySvc.table(tableRows);

    if (factory.consumption) {
      html +=
        '<div class="d-flex align-items-center justify-content-center flex-wrap mt-2">';
      for (const key of Object.keys(factory.consumption)) {
        html += this.displaySvc.icon(
          key,
          this.displaySvc.round(factory.consumption[key])
        );
      }
      html += '</div>';
    }

    html += '</small>';

    return html;
  }
}
