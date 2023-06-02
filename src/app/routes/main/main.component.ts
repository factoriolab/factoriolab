import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { Game, gameInfo, ItemId, MatrixResultType } from '~/models';
import { ContentService, ErrorService } from '~/services';
import { App, LabState, Objectives, Settings } from '~/store';

@Component({
  selector: 'lab-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements AfterViewInit {
  vm$ = combineLatest([
    this.store.select(Settings.getGame),
    this.store.select(Settings.getMod),
    this.store.select(Objectives.getMatrixResult),
    this.contentSvc.settingsActive$,
    this.contentSvc.settingsXlHidden$,
    this.contentSvc.scrollTop$,
    this.errorSvc.message$,
  ]).pipe(
    map(
      ([
        game,
        mod,
        result,
        settingsActive,
        settingsXlHidden,
        scrollTop,
        errorMsg,
      ]) => ({
        game,
        mod,
        result,
        settingsActive,
        settingsXlHidden,
        scrollTop,
        errorMsg,
      })
    )
  );

  isResetting = false;
  tabItems: MenuItem[] = [
    {
      label: 'app.list',
      icon: 'fa-solid fa-list',
      routerLink: 'list',
      queryParamsHandling: 'preserve',
    },
    {
      label: 'app.flow',
      icon: 'fa-solid fa-diagram-project',
      routerLink: 'flow',
      queryParamsHandling: 'preserve',
    },
    {
      label: 'app.data',
      icon: 'fa-solid fa-database',
      routerLink: 'data',
      queryParamsHandling: 'preserve',
    },
  ];

  Game = Game;
  ItemId = ItemId;
  MatrixResultType = MatrixResultType;

  constructor(
    public contentSvc: ContentService,
    private ngZone: NgZone,
    private ref: ChangeDetectorRef,
    private router: Router,
    private store: Store<LabState>,
    private errorSvc: ErrorService
  ) {}

  /**
   * This doesn't seem like it should be necessary,
   * but error message sometimes does not render without it
   * */
  ngAfterViewInit(): void {
    this.errorSvc.message$.subscribe(() => this.ref.detectChanges());
  }

  reset(game: Game): void {
    this.isResetting = true;
    // Give button loading indicator a chance to start
    setTimeout(() => {
      this.ngZone.run(() => {
        this.errorSvc.message$.next(null);
        this.router.navigateByUrl(gameInfo[game].route);
        this.store.dispatch(new App.ResetAction());
        this.isResetting = false;
      });
    }, 10);
  }
}
