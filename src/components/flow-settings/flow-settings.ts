import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';

import { FlowSettingsDialog } from './flow-settings-dialog';

@Injectable({ providedIn: 'root' })
export class FlowSettings {
  private readonly dialog = inject(Dialog);

  open(): void {
    this.dialog.open(FlowSettingsDialog, {
      data: { header: 'flowSettings.header' },
    });
  }
}
