import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabMenuModule } from 'primeng/tabmenu';
import { map } from 'rxjs';

import { HeaderComponent } from '~/components/header/header.component';
import { ObjectivesComponent } from '~/components/objectives/objectives.component';
import { SettingsComponent } from '~/components/settings/settings.component';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { TranslateService } from '~/services/translate.service';
import { ObjectivesService } from '~/store/objectives.service';
import { SettingsService } from '~/store/settings.service';

@Component({
  selector: 'lab-main',
  standalone: true,
  imports: [
    AsyncPipe,
    CardModule,
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
  objectivesSvc = inject(ObjectivesService);
  settingsSvc = inject(SettingsService);
  translateSvc = inject(TranslateService);

  mod = this.settingsSvc.mod;
  result = this.objectivesSvc.matrixResult;

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
}
