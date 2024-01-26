import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Used in tooltips / data pages to do a simple round on power usage values */
@Pipe({ name: 'translateKey' })
export class TranslateKeyPipe implements PipeTransform {
  translateSvc = inject(TranslateService);

  transform<T>(value: T[], key: keyof T): T[] {
    return value.map((o) => ({
      ...o,
      ...{
        [key]: this.translateSvc.instant(o[key] as string),
      },
    }));
  }
}
