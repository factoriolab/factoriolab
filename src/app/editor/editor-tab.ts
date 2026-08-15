import { computed, inject, Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons';

import { Option } from '~/option/option';

import { EditorData } from './editor.types';

export abstract class EditorTab {
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly iconOptions = computed(() => {
    const { data, icons } = this.edit();
    return data.icons
      .map(
        (i): Option => ({
          label: i.id,
          value: i.id,
          icon: icons[i.id]?.url,
        }),
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  });
}
