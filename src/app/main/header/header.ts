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
import { faBars, faMugHot } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { Game, gameOptions } from '~/models/game';
import { gameInfo } from '~/models/game-info';
import { SettingsStore } from '~/state/settings/settings-store';

interface ExternalLink {
  text: string;
  icon: IconDefinition;
  href: string;
}

@Component({
  selector: 'header[labHeader], header[lab-header]',
  exportAs: 'labHeader',
  imports: [RouterLink, Button, Select],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex justify-between h-16 items-center px-6' },
})
export class Header {
  private readonly router = inject(Router);
  private readonly settingsStore = inject(SettingsStore);

  readonly asideOpen = model.required<boolean>();
  readonly asideXlHidden = model.required<boolean>();

  protected readonly game = this.settingsStore.game;
  protected readonly gameInfo = this.settingsStore.gameInfo;
  protected readonly faBars = faBars;
  protected readonly faDiscord = faDiscord;
  protected readonly faGithub = faGithub;
  protected readonly faMugHot = faMugHot;

  protected readonly links: ExternalLink[] = [
    {
      text: 'header.source',
      icon: faGithub,
      href: 'https://github.com/factoriolab/factoriolab',
    },
    {
      text: 'header.discord',
      icon: faDiscord,
      href: 'https://discord.gg/N4FKV687x2',
    },
    {
      text: 'header.support',
      icon: faMugHot,
      href: 'https://ko-fi.com/dcbroad3',
    },
  ];

  gameOptions = computed(() =>
    gameOptions.filter((o) => o.value !== this.settingsStore.game()),
  );

  toggleAside(): void {
    this.asideOpen.update((o) => !o);
  }

  setGame(game: Game): void {
    void this.router.navigate([gameInfo[game].modId]);
  }
}
