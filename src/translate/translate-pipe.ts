import { inject, Pipe, PipeTransform } from '@angular/core';

import { Translate, TranslateData, TranslateParams } from './translate';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly translate = inject(Translate);

  private value = '';
  private key: string | undefined;
  private params: TranslateParams | undefined;
  private data: TranslateData | undefined;

  transform(key?: string, params?: TranslateParams): string {
    if (key == null) return '';

    const data = this.translate.data();
    if (key !== this.key || params !== this.params || data !== this.data) {
      this.value = this.translate.get(key, params);
      this.key = key;
      this.params = params;
      this.data = data;
    }

    return this.value;
  }
}
