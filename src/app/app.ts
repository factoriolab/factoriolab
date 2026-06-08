import { Dialog } from '@angular/cdk/dialog';
import { Component, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { faCheck, faRotate, faXmark } from '@fortawesome/free-solid-svg-icons';
import { filter, merge, switchMap } from 'rxjs';

import { Confirm } from '~/components/confirm/confirm';
import { CustomDataDialog } from '~/components/custom-data-dialog/custom-data-dialog';
import { CUSTOM_MOD } from '~/data/game';
import { Release } from '~/data/release';
import { SettingsStore } from '~/state/settings/settings-store';
import { log } from '~/utils/log';
import { WindowClient } from '~/utils/window-client';

@Component({
  selector: 'lab-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  host: { class: 'block h-full' },
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  protected readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly release = inject(Release);
  private readonly confirm = inject(Confirm);
  private readonly windowClient = inject(WindowClient);
  protected readonly settingsStore = inject(SettingsStore);

  // Stored on component to enable spyOn in tests
  private readonly log = log;

  constructor() {
    effect(() => {
      const config = this.release.config.value();
      if (config?.version) this.log('version', config.version);
    });

    effect(() => {
      if (
        this.settingsStore.modId() === CUSTOM_MOD &&
        this.settingsStore.customData.value() == null
      )
        this.dialog.open(CustomDataDialog);
    });

    merge(
      this.swUpdate.unrecoverable.pipe(
        switchMap(() =>
          this.confirm.open({
            header: 'app.updateRequired',
            message: 'app.updateRequiredMessage',
            icon: faRotate,
            actions: [{ text: 'ok', icon: faCheck }],
          }),
        ),
      ),
      this.swUpdate.versionUpdates.pipe(
        filter((event) => event.type === 'VERSION_READY'),
        switchMap(() =>
          this.confirm.open({
            header: 'app.updateAvailable',
            message: 'app.updateAvailableMessage',
            icon: faRotate,
            actions: [
              { text: 'ok', value: true, icon: faCheck },
              { text: 'cancel', value: false, icon: faXmark },
            ],
          }),
        ),
        filter((result) => !!result),
      ),
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.windowClient.reload();
      });
  }
}
