import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CanActivateFn, Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faExclamationCircle,
  faHome,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DEFAULT_MOD } from '~/data/datasets';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';
import { WindowClient } from '~/window/window-client';

import { getErrorInfo } from './error-info';

export const errorGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (!getErrorInfo(router)) return router.createUrlTree([DEFAULT_MOD]);
  return true;
};

@Component({
  selector: 'lab-error',
  imports: [RouterLink, FaIconComponent, Button, TranslatePipe],
  templateUrl: './error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-full justify-center p-4 flex-col items-center h-2/3 gap-4',
  },
})
export class Error {
  private readonly router = inject(Router);
  protected readonly settingsStore = inject(SettingsStore);
  private readonly windowClient = inject(WindowClient);

  protected readonly faExclamationCircle = faExclamationCircle;
  protected readonly faTrash = faTrash;
  protected readonly faHome = faHome;
  protected readonly info = getErrorInfo(this.router);

  async deleteCustom(): Promise<void> {
    this.settingsStore.customData.set(undefined);
    await this.router.navigate([
      '/',
      coalesce(this.settingsStore.modId(), DEFAULT_MOD),
    ]);
    this.windowClient.reload();
  }
}
