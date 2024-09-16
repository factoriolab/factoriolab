import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { TranslateService } from '~/services/translate.service';
import { selectAdjustedDataset } from '~/store/recipes/recipes.selectors';
import { selectModMenuItem } from '~/store/settings/settings.selectors';

@Component({ template: '' })
export abstract class DetailComponent {
  route = inject(ActivatedRoute);
  translateSvc = inject(TranslateService);
  store = inject(Store);

  home = this.store.selectSignal(selectModMenuItem);
  data = this.store.selectSignal(selectAdjustedDataset);

  id = input.required<string>();
  collectionLabel = input.required<string>();

  parent = toSignal(
    toObservable(this.collectionLabel).pipe(
      switchMap((label) => this.translateSvc.get(label)),
      map((label): MenuItem => ({ label })),
    ),
  );
}
