import { AsyncPipe } from '@angular/common';
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
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabMenuModule } from 'primeng/tabmenu';
import { map } from 'rxjs';

import {
  HeaderComponent,
  ObjectivesComponent,
  SettingsComponent,
} from '~/components';
import { SimplexResultType } from '~/models';
import { TranslatePipe } from '~/pipes';
import { ContentService, ErrorService, TranslateService } from '~/services';
import { App, Objectives, Settings } from '~/store';

@Component({
  selector: 'lab-main',
  standalone: true,
  imports: [
    AsyncPipe,
    ButtonModule,
    CardModule,
    DialogModule,
    ProgressSpinnerModule,
    TabMenuModule,
    HeaderComponent,
    ObjectivesComponent,
    SettingsComponent,
    TranslatePipe,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  contentSvc = inject(ContentService);
  ngZone = inject(NgZone);
  ref = inject(ChangeDetectorRef);
  router = inject(Router);
  store = inject(Store);
  errorSvc = inject(ErrorService);
  translateSvc = inject(TranslateService);

  gameInfo = this.store.selectSignal(Settings.selectGameInfo);
  mod = this.store.selectSignal(Settings.selectMod);
  result = this.store.selectSignal(Objectives.selectMatrixResult);

  isResetting = false;

  tabItems$ = this.translateSvc
    .multi(['app.list', 'app.flow', 'app.data'])
    .pipe(
      map(([list, flow, data]): MenuItem[] => [
        {
          label: list,
          icon: 'fa-solid fa-list',
          routerLink: 'list',
          queryParamsHandling: 'preserve',
        },
        {
          label: flow,
          icon: 'fa-solid fa-diagram-project',
          routerLink: 'flow',
          queryParamsHandling: 'preserve',
        },
        {
          label: data,
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
        this.store.dispatch(App.reset());
        this.isResetting = false;
      });
    }, 10);
  }
}
