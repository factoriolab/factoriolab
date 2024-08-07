import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { TranslateService } from '~/services';
import { Recipes, Settings } from '~/store';

@Component({ template: '' })
export abstract class DetailComponent {
  route = inject(ActivatedRoute);
  translateSvc = inject(TranslateService);
  store = inject(Store);

  home = this.store.selectSignal(Settings.selectModMenuItem);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);

  id = input.required<string>();
  collectionLabel = input.required<string>();

  parent = toSignal(
    toObservable(this.collectionLabel).pipe(
      switchMap((label) => this.translateSvc.get(label)),
      map((label): MenuItem => ({ label })),
    ),
  );
}
