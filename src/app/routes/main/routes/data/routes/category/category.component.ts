import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { Dataset } from '~/models';
import { LabState, Settings } from '~/store';
import { DataRouteService } from '../../data-route.service';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent {
  id$ = this.route.params.pipe(map((params) => params['id']));
  vm$ = combineLatest([
    this.id$,
    this.dataRouteSvc.home$,
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([id, home, data]) => ({
      id,
      obj: data.categoryEntities[id],
      breadcrumb: this.getBreadcrumb(id, data),
      home,
      data,
    }))
  );

  constructor(
    private route: ActivatedRoute,
    private translateSvc: TranslateService,
    private store: Store<LabState>,
    private dataRouteSvc: DataRouteService
  ) {}

  getBreadcrumb(id: string, data: Dataset): MenuItem[] {
    return [
      {
        label: this.translateSvc.instant('data.categories'),
        routerLink: '/data/categories',
        queryParamsHandling: 'preserve',
      },
      {
        label: data.categoryEntities[id].name,
      },
    ];
  }
}
