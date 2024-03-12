import { Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';

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

  parent = computed<MenuItem>(() => {
    return {
      label: this.translateSvc.instant(this.collectionLabel()),
      routerLink: '..',
      queryParamsHandling: 'preserve',
    };
  });
}
