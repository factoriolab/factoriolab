import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';

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

  gameInfo = this.store.selectSignal(Settings.getGameInfo);
  mod = this.store.selectSignal(Settings.getMod);
  result = this.store.selectSignal(Objectives.getMatrixResult);

  isResetting = false;
  tabItems: MenuItem[] = [
    {
      label: 'app.list',
      icon: 'fa-solid fa-list',
      routerLink: 'list',
    },
    {
      label: 'app.flow',
      icon: 'fa-solid fa-diagram-project',
      routerLink: 'flow',
    },
    {
      label: 'app.data',
      icon: 'fa-solid fa-database',
      routerLink: 'data',
    },
  ];

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
