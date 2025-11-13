import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { RouterSync } from '~/state/router/router-sync';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({
  selector: 'lab-id',
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>',
})
export class Id {
  private readonly route = inject(ActivatedRoute);
  private readonly routerSvc = inject(RouterSync);
  private readonly settingsStore = inject(SettingsStore);

  constructor() {
    const modId = this.route.snapshot.paramMap.get('id');
    if (modId) this.settingsStore.apply({ modId });
    this.routerSvc.route.next(this.route);
  }
}
