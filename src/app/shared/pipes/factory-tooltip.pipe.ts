import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset, Game } from '~/models';
import { DisplayService } from '~/services/display.service';

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

    let html = item.name + '\n<small><table class="w-100">';
    if (factory.speed && data.game !== Game.CaptainOfIndustry) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.craftingSpeed'
      )}</td><td>${this.displaySvc.round(factory.speed)}</td></tr>`;
    }

    if (factory.modules && data.game === Game.Factorio) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.modules'
      )}</td><td>${factory.modules}</td></tr>`;
    }

    if (factory.type) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.energyType'
      )}</td><td>${factory.type}</td></tr>`;
    }

    if (factory.category) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.fuelCategory'
      )}</td><td>${factory.category}</td></tr>`;
    }

    if (factory.usage?.nonzero()) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.energyUsage'
      )}</td><td>${this.displaySvc.power(factory.usage)}</td></tr>`;
    }

    if (factory.drain?.nonzero()) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.drain'
      )}</td><td>${this.displaySvc.power(factory.drain)}</td></tr>`;
    }

    if (factory.pollution?.nonzero()) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.pollution'
      )}</td><td>${this.displaySvc.round(factory.pollution)}/m</td></tr>`;
    }

    if (factory.silo) {
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.rocketPartsRequired'
      )}</td><td>${factory.silo.parts}</td></tr>`;
      html += `<tr><td>${this.translateSvc.instant(
        'tooltip.launchTime'
      )}</td><td>${this.displaySvc.round(factory.silo.launch)}s</td></tr>`;
    }

    html += '</table>';

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

    html += `<span class="mt-2">${this.translateSvc.instant(
      'tooltip.changeFactory'
    )}</span></small>`;

    return html;
  }
}
