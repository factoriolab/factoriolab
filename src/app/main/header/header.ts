import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faChevronDown,
  faSliders,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { externalLinks } from './external-link';

@Component({
  selector: 'header[labHeader], header[lab-header]',
  exportAs: 'labHeader',
  imports: [
    RouterLink,
    FaIconComponent,
    Button,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex justify-between min-h-19 md:min-h-16 items-center flex-wrap px-1 sm:px-3 lg:px-6 xl:flex-nowrap md:sticky top-0 backdrop-blur-md border-b border-gray-600 z-4',
  },
})
export class Header {
  private readonly router = inject(Router);
  private readonly settingsStore = inject(SettingsStore);

  readonly preferencesOpen = model.required<boolean>();
  readonly preferencesXlHidden = model.required<boolean>();
  readonly settingsOpen = model.required<boolean>();
  readonly settingsXlHidden = model.required<boolean>();

  protected readonly faChevronDown = faChevronDown;
  protected readonly faSliders = faSliders;
  protected readonly faUserGear = faUserGear;
  protected readonly game = this.settingsStore.game;
  protected readonly gameInfo = this.settingsStore.gameInfo;
  protected readonly externalLinks = externalLinks;

  protected readonly gameOptions = computed(() =>
    gameOptions.filter((o) => o.value !== this.settingsStore.game()),
  );

  togglePreferences(): void {
    this.preferencesOpen.update((o) => !o);
  }

  toggleSettings(): void {
    this.settingsOpen.update((o) => !o);
  }

  setGame(game: Game): void {
    void this.router.navigate([gameInfo[game].modId]);
  }
}
