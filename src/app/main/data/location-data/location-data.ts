import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { Icon } from '~/components/icon/icon';
import { CategoryJson } from '~/data/schema/category';
import { LinkOption } from '~/option/link-option';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-location-data',
  imports: [Breadcrumb, Icon, TranslatePipe],
  templateUrl: './location-data.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationData {
  private readonly settingsStore = inject(SettingsStore);

  readonly id = input.required<string>();
  readonly collectionLabel = input.required<string>();

  protected readonly obj = computed(
    (): CategoryJson | undefined =>
      this.settingsStore.dataset().locationRecord[this.id()],
  );
  protected readonly crumbs = computed(() => {
    const result: LinkOption[] = [
      { label: this.collectionLabel(), routerLink: '..' },
    ];
    const label = this.obj()?.name;
    if (label != null) result.push({ label });
    return result;
  });
}
