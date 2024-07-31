import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { TranslateService } from '~/services';
import { LabState, Recipes, Settings } from '~/store';

@Component({ selector: 'lab-detail', template: '' })
export class DetailComponent {
  route = inject(ActivatedRoute);
  translateSvc = inject(TranslateService);
  store = inject(Store<LabState>);

  home = this.store.selectSignal(Settings.getModMenuItem);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);

  id = input.required<string>();
  collectionLabel = input.required<string>();

  parent = toSignal(
    toObservable(this.collectionLabel).pipe(
      switchMap((label) => this.translateSvc.get(label)),
      map((label): MenuItem => ({ label })),
    ),
  );
}
