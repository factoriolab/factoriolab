import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { faCheck, faRotate, faXmark } from '@fortawesome/free-solid-svg-icons';
import { filter, merge, switchMap } from 'rxjs';

import { Confirm } from '~/components/confirm/confirm';
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
    merge(
      this.swUpdate.unrecoverable.pipe(
        switchMap(() =>
          this.confirm.show({
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
          this.confirm.show({
            header: 'app.updateAvailable',
            message: 'app.updateAvailableMessage',
            icon: faRotate,
            actions: [
              { text: 'cancel', value: false, icon: faXmark },
              { text: 'ok', value: true, icon: faCheck },
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
