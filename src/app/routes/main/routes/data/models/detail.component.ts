import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { TranslateService } from '~/services/translate.service';
import { RecipesStore } from '~/store/recipes.store';
import { SettingsStore } from '~/store/settings.store';

@Component({ template: '' })
export abstract class DetailComponent {
  route = inject(ActivatedRoute);
  recipesSvc = inject(RecipesStore);
  settingsSvc = inject(SettingsStore);
  translateSvc = inject(TranslateService);

  home = this.settingsSvc.modMenuItem;
  data = this.recipesSvc.adjustedDataset;

  id = input.required<string>();
  collectionLabel = input.required<string>();

  parent = toSignal(
    toObservable(this.collectionLabel).pipe(
      switchMap((label) => this.translateSvc.get(label)),
      map(
        (label): MenuItem => ({
          label,
          routerLink: '..',
          queryParamsHandling: 'preserve',
        }),
      ),
    ),
  );
  dataRoute = computed(() => {
    const data = this.data();
    return `/${data.modId}/data/`;
  });
}
