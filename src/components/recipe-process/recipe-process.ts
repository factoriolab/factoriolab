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

import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Icon } from '../icon/icon';

@Component({
  selector: 'lab-recipe',
  imports: [FaIconComponent, KeyValuePipe, Icon, TranslatePipe],
  templateUrl: './recipe-process.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex flex-col',
  },
})
export class RecipeProcess {
  private readonly settingsStore = inject(SettingsStore);

  readonly value = input.required<string>();

  protected readonly data = this.settingsStore.dataset;

  readonly recipe = computed(() => this.data().recipeRecord[this.value()]);

  protected readonly faArrowRightLong = faArrowRightLong;
}
