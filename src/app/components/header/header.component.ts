import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, map, startWith } from 'rxjs';

import { APP, gameInfo, games } from '~/models';
import { ContentService } from '~/services';
import { LabState, Settings } from '~/store';

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
  game$ = this.store.select(Settings.getGame).pipe(untilDestroyed(this));
  lang$ = this.translateSvc.onLangChange.pipe(
    untilDestroyed(this),
    startWith('')
  );

  gameInfo$ = this.game$.pipe(map((g) => gameInfo[g]));
  gameOptions$ = combineLatest([this.game$, this.lang$]).pipe(
    map(([game]) =>
      games
        .filter((g) => g !== game)
        .map(
          (g): MenuItem => ({
            icon: 'lab-icon-sm ' + gameInfo[g].icon,
            label: this.translateSvc.instant(gameInfo[g].label),
            command: () => this.selectGame(gameInfo[g].route),
          })
        )
    )
  );

  vm$ = combineLatest([this.gameInfo$, this.gameOptions$]).pipe(
    map(([gameInfo, gameOptions]) => ({ gameInfo, gameOptions }))
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

  constructor(
    public contentSvc: ContentService,
    private router: Router,
    private titleSvc: Title,
    private store: Store<LabState>,
    private translateSvc: TranslateService
  ) {}

  ngOnInit(): void {
    combineLatest([this.game$, this.lang$]).subscribe(([game]) => {
      const title = this.translateSvc.instant(gameInfo[game].title);
      this.titleSvc.setTitle(`${APP} | ${title}`);
    });
  }

  selectGame(route: string): void {
    this.router.navigateByUrl(route);
  }
}
