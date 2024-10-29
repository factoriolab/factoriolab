import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { map, switchMap } from 'rxjs';

import { TranslateService } from '~/services/translate.service';
import { RecipesService } from '~/store/recipes.service';
import { SettingsService } from '~/store/settings.service';

@Component({ template: '' })
export abstract class DetailComponent {
  route = inject(ActivatedRoute);
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);
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
