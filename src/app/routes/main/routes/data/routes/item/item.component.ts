import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { DisplayService } from '~/services';
import { LabState, Settings } from '~/store';
import { DataRouteService } from '../../data-route.service';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent extends DetailComponent {
  vm$ = combineLatest([
    this.id$,
    this.parent$,
    this.dataRouteSvc.home$,
    this.store.select(Settings.getDataset),
  ]).pipe(
    map(([id, parent, home, data]) => ({
      id,
      obj: data.itemEntities[id],
      breadcrumb: [parent, { label: data.itemEntities[id].name }],
      home,
      data,
    }))
  );

  constructor(
    route: ActivatedRoute,
    translateSvc: TranslateService,
    private store: Store<LabState>,
    private dataRouteSvc: DataRouteService,
    public displaySvc: DisplayService
  ) {
    super(route, translateSvc);
  }
}
