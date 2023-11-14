import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { APP, Game, gameInfo, gameOptions, isRecipeObjective } from '~/models';
import { ContentService } from '~/services';
import { LabState, Objectives, Settings } from '~/store';

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
  title = inject(Title);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  contentSvc = inject(ContentService);

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
    })),
  );

  links: MenuLink[] = [
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

  ngOnInit(): void {
    combineLatest([
      this.store.select(Objectives.getBaseObjectives),
      this.store.select(Settings.getDataset),
      this.contentSvc.lang$,
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([objectives, data]) => {
        const name = objectives
          .map((o) =>
            isRecipeObjective(o)
              ? data.recipeEntities[o.targetId]?.name
              : data.itemEntities[o.targetId]?.name,
          )
          .find((n) => n != null);
        if (name != null) {
          this.title.setTitle(`${name} | ${APP}`);
        } else {
          this.title.setTitle(APP);
        }
      });
  }

  buildGameOptions(game: Game): MenuItem[] {
    return gameOptions
      .map((o) => o.value)
      .filter((g) => g !== game)
      .map(
        (g): MenuItem => ({
          icon: 'lab-icon small ' + gameInfo[g].icon,
          label: this.translateSvc.instant(gameInfo[g].label),
          routerLink: gameInfo[g].route,
        }),
      );
  }

  cancelRouterLink(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
