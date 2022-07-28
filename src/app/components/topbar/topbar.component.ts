import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { combineLatest, startWith } from 'rxjs';

import { APP, Game, GameInfo, Games } from '~/models';
import { LabState, Settings } from '~/store';

interface MenuLink {
  label: string;
  icon: string;
  href: string;
}

@UntilDestroy()
@Component({
  selector: 'lab-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter();

  gameCtrl = this.fb.control<Game>(Game.Factorio);
  gameOptions: SelectItem<Game>[] = Games.map((g) => ({
    icon: GameInfo[g].icon,
    value: g,
    label: GameInfo[g].route,
    title: this.translateSvc.instant(GameInfo[g].title),
  }));

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

  game$ = this.store.select(Settings.getGame).pipe(untilDestroyed(this));
  lang$ = this.translateSvc.onLangChange.pipe(untilDestroyed(this));

  constructor(
    private fb: FormBuilder,
    private ref: ChangeDetectorRef,
    private router: Router,
    private titleSvc: Title,
    private store: Store<LabState>,
    private translateSvc: TranslateService
  ) {}

  ngOnInit(): void {
    this.game$.subscribe((game) => {
      this.gameCtrl.setValue(game, { emitEvent: false });
    });

    this.lang$.subscribe(() => {
      this.gameOptions.forEach(
        (opt) =>
          (opt.title = this.translateSvc.instant(GameInfo[opt.value].title))
      );
      this.ref.markForCheck();
    });

    combineLatest([this.game$, this.lang$.pipe(startWith('en'))]).subscribe(
      ([game, lang]) => {
        const title = this.translateSvc.instant(GameInfo[game].title);
        this.titleSvc.setTitle(`${APP} | ${title}`);
      }
    );
  }

  selectGame(event: { option: SelectItem<Game> }) {
    this.router.navigateByUrl(event.option.label ?? '');
  }
}
