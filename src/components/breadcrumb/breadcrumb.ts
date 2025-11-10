import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { LinkOption } from '~/option/link-option';
import { SettingsStore } from '~/state/settings/settings-store';
import { resetTableParams } from '~/state/table/table-state';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-breadcrumb',
  imports: [RouterLink, FaIconComponent, TranslatePipe],
  templateUrl: './breadcrumb.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center gap-1 py-2 border-b border-gray-700' },
})
export class Breadcrumb {
  private readonly settingsStore = inject(SettingsStore);

  readonly items = input<LinkOption[]>();

  readonly crumbs = computed(() => {
    const modMenuItem = this.settingsStore.modMenuItem();
    const items = this.items();
    if (items == null) return [modMenuItem];
    return [modMenuItem, ...items];
  });

  protected readonly faChevronRight = faChevronRight;
  protected readonly resetTableParams = resetTableParams;
}
