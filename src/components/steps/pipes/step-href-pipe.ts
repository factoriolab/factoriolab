import { inject, Pipe, PipeTransform } from '@angular/core';

import { Step } from '~/solver/step';
import { LabParams } from '~/state/router/lab-params';
import { RouterSync } from '~/state/router/router-sync';
import { ZipData } from '~/state/router/zip-data';

@Pipe({ name: 'stepHref', standalone: true })
export class StepHrefPipe implements PipeTransform {
  private readonly routerSync = inject(RouterSync);

  async transform(
    value: Step,
    zipPartial: ZipData<LabParams>,
  ): Promise<LabParams | null> {
    return this.routerSync.stepHref(value, zipPartial);
  }
}
