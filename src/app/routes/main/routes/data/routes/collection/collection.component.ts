import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';

import { AppSharedModule } from '~/app-shared.module';
import { IdType, RawDataset } from '~/models';
import { LabState, Recipes, Settings } from '~/store';
import { DataSharedModule } from '../../data-shared.module';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule, DataSharedModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent {
  route = inject(ActivatedRoute);
  translateSvc = inject(TranslateService);
  store = inject(Store<LabState>);

  home = this.store.selectSignal(Settings.getModMenuItem);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);

  label = input.required<string>();
  type = input.required<IdType>();
  key = input.required<keyof RawDataset>();

  breadcrumb = computed<MenuItem[]>(() => [
    {
      label: this.translateSvc.instant(this.label()),
    },
  ]);
  ids = computed<string[]>(() => this.data()[this.key()] as string[]);
}
