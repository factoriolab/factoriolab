import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { APP, Game, gameInfo, gameOptions, games } from '~/models';
import { ContentService } from '~/services';
import { LabState, Producers, Products, Settings } from '~/store';

interface MenuLink {
  label: string;
  icon: string;
  href: string;
}

@UntilDestroy()
@Component({
  selector: 'lab-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @HostBinding('class.sticky') @Input() sticky = false;
  @HostBinding('class.settings-xl-hidden') @Input() settingsXlHidden = false;

  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.contentSvc.settingsXlHidden$,
  ]).pipe(
    map(([game, settingsXlHidden]) => ({
      gameInfo: gameInfo[game],
      gameOptions: this.buildGameOptions(game),
      settingsXlHidden,
    }))
  );

  links: MenuLink[] = [
    {
      label: 'Wiki',
      icon: 'fa-solid fa-book',
      href: 'https://github.com/factoriolab/factoriolab/wiki',
    },
    {
      label: 'Source',
      icon: 'fa-brands fa-github',
      href: 'https://github.com/factoriolab/factoriolab',
    },
    {
      label: 'Discord',
      icon: 'fa-brands fa-discord',
      href: 'https://discord.gg/N4FKV687x2',
    },
    {
      label: 'Support',
      icon: 'fa-solid fa-mug-hot',
      href: 'https://ko-fi.com/dcbroad3',
    },
  ];
  gameInfo = gameInfo;
  gameOptions = gameOptions;

  constructor(
    public contentSvc: ContentService,
    private title: Title,
    private store: Store<LabState>,
    private translateSvc: TranslateService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.store.select(Products.getBaseProducts),
      this.store.select(Producers.getBaseProducers),
      this.store.select(Settings.getDataset),
      this.contentSvc.lang$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([products, producers, data]) => {
        if (products.length && data.itemEntities[products[0].itemId]) {
          this.title.setTitle(
            `${data.itemEntities[products[0].itemId].name} | ${APP}`
          );
        } else if (
          producers.length &&
          data.recipeEntities[producers[0].recipeId]
        ) {
          this.title.setTitle(
            `${data.recipeEntities[producers[0].recipeId].name} | ${APP}`
          );
        } else {
          this.title.setTitle(APP);
        }
      });
  }

  buildGameOptions(game: Game): MenuItem[] {
    return games
      .filter((g) => g !== game)
      .map(
        (g): MenuItem => ({
          icon: 'lab-icon-sm ' + gameInfo[g].icon,
          label: this.translateSvc.instant(gameInfo[g].label),
          routerLink: gameInfo[g].route,
        })
      );
  }

  cancelRouterLink(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
