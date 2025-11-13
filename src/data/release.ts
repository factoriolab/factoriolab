import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';

import { ReleaseInfo } from '~/data/release-info';

@Injectable({ providedIn: 'root' })
export class Release {
  readonly config = httpResource<ReleaseInfo>(() => 'release.json');
  readonly version = computed(() => {
    const config = this.config.value();
    if (config == null) return '';
    return `FactorioLab ${config.version || '(dev)'}`;
  });
}
