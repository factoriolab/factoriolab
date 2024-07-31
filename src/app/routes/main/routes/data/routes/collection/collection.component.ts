import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { Dataset, IdType } from '~/models';
import { TranslateService } from '~/services';
import { LabState, Recipes, Settings } from '~/store';
import { DataSharedModule } from '../../data-shared.module';

@Component({
  standalone: true,
  imports: [AppSharedModule, DataSharedModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent {
  translateSvc = inject(TranslateService);
  route = inject(ActivatedRoute);
  store = inject(Store<LabState>);

  home = this.store.selectSignal(Settings.getModMenuItem);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);

  label = input.required<string>();
  type = input.required<IdType>();
  key = input.required<keyof Dataset>();

  breadcrumb = toSignal(
    toObservable(this.label).pipe(
      switchMap((label) => this.translateSvc.get(label)),
      map((label): MenuItem[] => [{ label }]),
    ),
  );
  ids = computed<string[]>(() => this.data()[this.key()] as string[]);
}
