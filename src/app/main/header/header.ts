import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faBars, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/data/game';
import { gameInfo } from '~/data/game-info';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

interface ExternalLink {
  text: string;
  icon: IconDefinition;
  href: string;
}

@Component({
  selector: 'header[labHeader], header[lab-header]',
  exportAs: 'labHeader',
  imports: [RouterLink, Button, Select, TranslatePipe],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex justify-between min-h-19 md:min-h-16 items-center flex-wrap sm:px-3 lg:px-6 xl:flex-nowrap md:sticky top-0 backdrop-blur-md border-b border-gray-700',
  },
})
export class Header {
  private readonly router = inject(Router);
  private readonly settingsStore = inject(SettingsStore);

  readonly asideOpen = model.required<boolean>();
  readonly asideXlHidden = model.required<boolean>();

  protected readonly game = this.settingsStore.game;
  protected readonly gameInfo = this.settingsStore.gameInfo;

  protected readonly faBars = faBars;
  protected readonly links: ExternalLink[] = [
    {
      text: 'header.discord',
      icon: faDiscord,
      href: 'https://discord.gg/N4FKV687x2',
    },
    {
      text: 'header.sponsor',
      icon: faHandHoldingDollar,
      href: 'https://ko-fi.com/dcbroad3',
    },
    {
      text: 'header.source',
      icon: faGithub,
      href: 'https://github.com/factoriolab/factoriolab',
    },
  ];

  protected readonly gameOptions = computed(() =>
    gameOptions.filter((o) => o.value !== this.settingsStore.game()),
  );

  toggleAside(): void {
    this.asideOpen.update((o) => !o);
  }

  setGame(game: Game): void {
    void this.router.navigate([gameInfo[game].modId]);
  }
}
