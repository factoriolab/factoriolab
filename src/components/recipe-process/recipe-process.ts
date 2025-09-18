import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';

import { RoundPipe } from '~/rational/round-pipe';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';

@Component({
  selector: 'lab-recipe',
  imports: [FaIconComponent, KeyValuePipe, Icon, RoundPipe, TranslatePipe],
  templateUrl: './recipe-process.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex flex-col',
  },
})
export class RecipeProcess {
  private readonly settingsStore = inject(SettingsStore);
  private readonly recipesStore = inject(RecipesStore);

  readonly value = input.required<string>();

  protected readonly data = this.settingsStore.dataset;
  protected readonly faArrowRightLong = faArrowRightLong;

  protected readonly recipe = computed(
    () => this.data().recipeRecord[this.value()],
  );
  protected readonly machineId = computed(
    () => this.recipesStore.settings()[this.value()].machineId,
  );
}
