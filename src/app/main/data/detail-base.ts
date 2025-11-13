import { Component, computed, inject, input, Signal } from '@angular/core';

import { Category } from '~/data/schema/category';
import { Item } from '~/data/schema/item';
import { Recipe } from '~/data/schema/recipe';
import { LinkOption } from '~/option/link-option';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';

@Component({ template: '' })
export abstract class DetailBase<T extends Category | Item | Recipe> {
  protected readonly settingsStore = inject(SettingsStore);
  private readonly recipesStore = inject(RecipesStore);

  readonly id = input.required<string>();
  readonly collectionLabel = input.required<string>();

  protected abstract readonly obj: Signal<T | undefined>;
  protected readonly data = this.recipesStore.adjustedDataset;

  protected readonly crumbs = computed(() => {
    const result: LinkOption[] = [
      { label: this.collectionLabel(), routerLink: '..' },
    ];
    const label = this.obj()?.name;
    if (label != null) result.push({ label });
    return result;
  });
}
