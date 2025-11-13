import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { CollectionKey } from '~/components/collection-table/collection-key';
import { CollectionTable } from '~/components/collection-table/collection-table';
import { IconType } from '~/data/icon-type';
import { LinkOption } from '~/option/link-option';
import { SettingsStore } from '~/state/settings/settings-store';
import { TableStore } from '~/state/table/table-store';

@Component({
  selector: 'lab-collection',
  imports: [Breadcrumb, CollectionTable],
  templateUrl: './collection.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Collection {
  private readonly settingsStore = inject(SettingsStore);
  protected readonly tableStore = inject(TableStore);

  readonly label = input.required<string>();
  readonly key = input.required<CollectionKey>();
  readonly iconType = input.required<IconType>();

  protected readonly crumbs = computed<LinkOption[]>(() => [
    { label: this.label() },
  ]);
  protected readonly ids = computed(
    () => this.settingsStore.dataset()[this.key()],
  );
}
