import { DialogRef } from '@angular/cdk/dialog';
import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-versions-dialog',
  imports: [KeyValuePipe, Button, TranslatePipe],
  templateUrl: './versions-dialog.html',
  styleUrl: './versions-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex w-md max-w-full flex-col gap-3 overflow-hidden p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0',
  },
})
export class VersionsDialog implements DialogData {
  protected readonly dialogRef = inject(DialogRef);
  protected readonly settingsStore = inject(SettingsStore);

  protected readonly faCheck = faCheck;
  readonly header = 'settings.modVersions';
}
