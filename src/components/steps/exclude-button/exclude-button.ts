import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import { Tooltip } from '~/components/tooltip/tooltip';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { updateSetIds } from '~/utils/set';

import { Button } from '../../button/button';

@Component({
  selector: 'lab-exclude-button',
  imports: [Button, Tooltip, TranslatePipe],
  templateUrl: './exclude-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExcludeButton {
  protected readonly settingsStore = inject(SettingsStore);

  readonly itemId = input.required<string>();

  protected readonly faEyeSlash = faEyeSlash;

  protected readonly excluded = computed(() =>
    this.settingsStore.settings().excludedItemIds.has(this.itemId()),
  );
  protected readonly tooltip = computed(() =>
    this.excluded() ? 'steps.includeItemTooltip' : 'steps.excludeItemTooltip',
  );

  changeItemExcluded(): void {
    const itemId = this.itemId();
    let excludedItemIds = this.settingsStore.settings().excludedItemIds;
    const value = !excludedItemIds.has(itemId);
    excludedItemIds = updateSetIds(itemId, value, excludedItemIds);
    this.settingsStore.apply({ excludedItemIds });
  }
}
