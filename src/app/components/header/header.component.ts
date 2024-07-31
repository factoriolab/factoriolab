import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  Input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { APP, Game, gameInfo, gameOptions, isRecipeObjective } from '~/models';
import { ContentService, TranslateService } from '~/services';
import { LabState, Objectives, Settings } from '~/store';

interface MenuLink {
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  title = inject(Title);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);

  @HostBinding('class.sticky') @Input() sticky = false;
  @HostBinding('class.settings-xl-hidden') @Input() settingsXlHidden = false;

  gameInfo = this.store.selectSignal(Settings.getGameInfo);
  gameOptions = toSignal(
    combineLatest([
      this.store.select(Settings.getGame),
      ...gameOptions.map((o) => this.translateSvc.get(gameInfo[o.value].label)),
    ]).pipe(
      map(([game, ...labels]): MenuItem[] => {
        return gameOptions
          .map((o, i): [Game, string] => [o.value, labels[i]])
          .filter(([g]) => g !== game)
          .map(
            ([g, label]): MenuItem => ({
              icon: 'lab-icon small ' + gameInfo[g].icon,
              label,
              routerLink: gameInfo[g].route,
            }),
          );
      }),
    ),
  );

  links: MenuLink[] = [
    {
      label: 'header.source',
      icon: 'fa-brands fa-github',
      href: 'https://github.com/factoriolab/factoriolab',
    },
    {
      label: 'header.discord',
      icon: 'fa-brands fa-discord',
      href: 'https://discord.gg/N4FKV687x2',
    },
    {
      label: 'header.support',
      icon: 'fa-solid fa-mug-hot',
      href: 'https://ko-fi.com/dcbroad3',
    },
  ];

  constructor() {
    combineLatest([
      this.store.select(Objectives.getBaseObjectives),
      this.store.select(Settings.getDataset),
      this.translateSvc.lang$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([objectives, data]) => {
        const name = objectives
          .map((o) =>
            isRecipeObjective(o)
              ? data.recipeEntities[o.targetId]?.name
              : data.itemEntities[o.targetId]?.name,
          )
          .find((n) => n != null);
        this.title.setTitle(name != null ? `${name} | ${APP}` : APP);
      });
  }

  cancelRouterLink(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
