import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  Input,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TooltipModule } from 'primeng/tooltip';
import { combineLatest, map } from 'rxjs';

import { APP, Game, gameInfo, gameOptions, isRecipeObjective } from '~/models';
import { IconSmClassPipe, TranslatePipe } from '~/pipes';
import { ContentService, TranslateService } from '~/services';
import { Objectives, Settings } from '~/store';

interface MenuLink {
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'lab-header',
  standalone: true,
  imports: [
    RouterLink,
    ButtonModule,
    SplitButtonModule,
    TooltipModule,
    IconSmClassPipe,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  title = inject(Title);
  store = inject(Store);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);

  @HostBinding('class.sticky') @Input() sticky = false;
  @HostBinding('class.settings-xl-hidden') @Input() settingsXlHidden = false;

  gameInfo = this.store.selectSignal(Settings.selectGameInfo);
  gameOptions = toSignal(
    combineLatest([
      this.store.select(Settings.selectGame),
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
    combineLatest({
      objectives: this.store.select(Objectives.selectBaseObjectives),
      data: this.store.select(Settings.selectDataset),
      lang: this.translateSvc.lang$,
    })
      .pipe(takeUntilDestroyed())
      .subscribe(({ objectives, data }) => {
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
