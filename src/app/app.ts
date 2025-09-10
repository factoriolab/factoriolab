import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { faRotate } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, filter, switchMap } from 'rxjs';

import { Confirm } from '~/components/confirm-dialog/confirm';
import { WindowClient } from '~/window/window-client';

@Component({
  selector: 'lab-root',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
  host: { class: 'block h-full' },
})
export class App {
  private readonly swUpdate = inject(SwUpdate);
  private readonly confirm = inject(Confirm);
  private readonly windowClient = inject(WindowClient);

  constructor() {
    combineLatest([
      this.swUpdate.unrecoverable.pipe(
        switchMap(() =>
          this.confirm.show({
            header: 'app.updateRequired',
            message: 'app.updateRequiredMessage',
            icon: faRotate,
            actions: [{ text: 'ok' }],
          }),
        ),
      ),
      this.swUpdate.versionUpdates.pipe(
        filter((event) => event.type === 'VERSION_READY'),
        switchMap(() =>
          this.confirm.show({
            header: 'app.updateAvailable',
            message: 'app.updateAvailableMessage',
            icon: faRotate,
            actions: [
              { text: 'cancel', value: false },
              { text: 'ok', value: true },
            ],
          }),
        ),
        filter((result) => !!result),
      ),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.windowClient.reload();
      });
  }
}
