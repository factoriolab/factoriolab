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
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { map, switchMap } from 'rxjs';

import { CollectionTableComponent } from '~/components';
import { Dataset, IdType } from '~/models';
import { TranslateService } from '~/services';
import { Recipes, Settings } from '~/store';

@Component({
  standalone: true,
  imports: [BreadcrumbModule, CollectionTableComponent],
  templateUrl: './collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionComponent {
  translateSvc = inject(TranslateService);
  route = inject(ActivatedRoute);
  store = inject(Store);

  home = this.store.selectSignal(Settings.selectModMenuItem);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);

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
