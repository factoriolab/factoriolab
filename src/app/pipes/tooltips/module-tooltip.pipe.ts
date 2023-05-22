import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'moduleTooltip' })
export class ModuleTooltipPipe implements PipeTransform {
  constructor(
    private translateSvc: TranslateService,
    private displaySvc: DisplayService
  ) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];
    const module = item?.module;

    if (item == null || module == null) return '';

    let html = item.name + '\n<small>';

    const tableRows: [string, string][] = [];
    if (module.consumption?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.energyConsumption'),
        this.displaySvc.toBonusPercent(module.consumption),
      ]);
    }

    if (module.speed?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.speed'),
        this.displaySvc.toBonusPercent(module.speed),
      ]);
    }

    if (module.productivity?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.productivity'),
        this.displaySvc.toBonusPercent(module.productivity),
      ]);
    }

    if (module.pollution?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.pollution'),
        this.displaySvc.toBonusPercent(module.pollution),
      ]);
    }

    if (module.sprays?.nonzero()) {
      tableRows.push([
        this.translateSvc.instant('data.sprays'),
        this.displaySvc.round(module.sprays),
      ]);
    }

    html += this.displaySvc.table(tableRows);

    html += '</small>';

    return html;
  }
}
