import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabMenuModule } from 'primeng/tabmenu';
import { map } from 'rxjs';

import { HeaderComponent } from '~/components/header/header.component';
import { ObjectivesComponent } from '~/components/objectives/objectives.component';
import { SettingsComponent } from '~/components/settings/settings.component';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { ErrorService } from '~/services/error.service';
import { ObjectivesService } from '~/services/objectives.service';
import { SettingsService } from '~/services/settings.service';
import { TranslateService } from '~/services/translate.service';

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
  ngZone = inject(NgZone);
  ref = inject(ChangeDetectorRef);
  router = inject(Router);
  contentSvc = inject(ContentService);
  errorSvc = inject(ErrorService);
  objectivesSvc = inject(ObjectivesService);
  settingsSvc = inject(SettingsService);
  translateSvc = inject(TranslateService);

  mod = this.settingsSvc.mod;
  gameInfo = this.settingsSvc.gameInfo;
  result = this.objectivesSvc.matrixResult;

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
        this.errorSvc.message$.next(undefined);
        void this.router.navigate([this.gameInfo().route]);
        this.isResetting = false;
      });
    }, 10);
  }
}
