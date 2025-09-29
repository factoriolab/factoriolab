import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faFlaskVial } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { Tooltip } from '~/components/tooltip/tooltip';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { StepDetail } from '~/state/objectives/step-detail';
import { SettingsStore } from '~/state/settings/settings-store';
import { updateSetIds } from '~/utils/set';

@Component({
  selector: 'lab-recipes-select',
  imports: [FormsModule, FaIconComponent, Icon, Select, Tooltip],
  templateUrl: './recipes-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class RecipesSelect {
  protected readonly objectivesStore = inject(ObjectivesStore);
  protected readonly settingsStore = inject(SettingsStore);

  readonly step = input.required<Step>();

  protected readonly details = computed<StepDetail | undefined>(
    () => this.objectivesStore.stepDetails()[this.step().id],
  );

  protected readonly faChevronDown = faChevronDown;
  protected readonly faFlaskVial = faFlaskVial;

  changeRecipesIncluded(includedIds: string[]): void {
    const details = this.details();
    if (details == null) return;
    const allIds = details.recipeIds;
    const settings = this.settingsStore.settings();
    let value = updateSetIds(allIds, true, settings.excludedRecipeIds);
    value = updateSetIds(includedIds, false, value);
    this.settingsStore.updateField(
      'excludedRecipeIds',
      value,
      settings.defaultExcludedRecipeIds,
    );
  }
}
