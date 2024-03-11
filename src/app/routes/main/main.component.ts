import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { map } from 'rxjs';

import { SimplexResultType } from '~/models';
import { ContentService, ErrorService } from '~/services';
import { App, LabState, Objectives, Settings } from '~/store';

@Component({
  selector: 'lab-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  contentSvc = inject(ContentService);
  ngZone = inject(NgZone);
  ref = inject(ChangeDetectorRef);
  router = inject(Router);
  store = inject(Store<LabState>);
  errorSvc = inject(ErrorService);
  translateSvc = inject(TranslateService);

  gameInfo = this.store.selectSignal(Settings.getGameInfo);
  mod = this.store.selectSignal(Settings.getMod);
  result = this.store.selectSignal(Objectives.getMatrixResult);

  isResetting = false;

  tabItems$ = this.contentSvc.lang$.pipe(
    map((): MenuItem[] => [
      {
        label: this.translateSvc.instant('app.list'),
        icon: 'fa-solid fa-list',
        routerLink: 'list',
        queryParamsHandling: 'preserve',
      },
      {
        label: this.translateSvc.instant('app.flow'),
        icon: 'fa-solid fa-diagram-project',
        routerLink: 'flow',
        queryParamsHandling: 'preserve',
      },
      {
        label: this.translateSvc.instant('app.data'),
        icon: 'fa-solid fa-database',
        routerLink: 'data',
        queryParamsHandling: 'preserve',
      },
    ]),
  );

  SimplexResultType = SimplexResultType;

  reset(): void {
    this.isResetting = true;
    // Give button loading indicator a chance to start
    setTimeout(() => {
      this.ngZone.run(() => {
        this.errorSvc.message.set(null);
        this.router.navigateByUrl(this.gameInfo().route);
        this.store.dispatch(new App.ResetAction());
        this.isResetting = false;
      });
    }, 10);
  }
}
