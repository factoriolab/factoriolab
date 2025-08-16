import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({
  selector: 'header[labHeader], header[lab-header]',
  exportAs: 'labHeader',
  imports: [RouterLink, Button],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex justify-between' },
})
export class Header {
  private readonly settingsStore = inject(SettingsStore);

  readonly asideOpen = model.required<boolean>();
  readonly asideXlHidden = model.required<boolean>();

  protected readonly game = this.settingsStore.game;
  protected readonly gameInfo = this.settingsStore.gameInfo;
  protected readonly faBars = faBars;

  toggleAside(): void {
    this.asideOpen.update((o) => !o);
  }
}
