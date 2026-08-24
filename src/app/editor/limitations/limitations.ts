import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorTab } from '../editor-tab';
import { toOptions } from '../object-utils';

@Component({
  selector: 'lab-limitations',
  imports: [
    FormsModule,
    KeyValuePipe,
    Button,
    Icon,
    OptionPipe,
    Select,
    TranslatePipe,
  ],
  templateUrl: './limitations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Limitations extends EditorTab {
  protected readonly faXmark = faXmark;
  protected readonly limitations = computed(() => {
    const { data } = this.edit();
    data.limitations ??= {};
    return data.limitations;
  });
  protected readonly model: { name: string; recipeIds: string[] } = {
    name: '',
    recipeIds: [],
  };
  protected readonly recipeOptions = computed(() => {
    const { data, icons } = this.edit();
    return toOptions(data.recipes, icons);
  });

  updateKey(oldKey: string, newKey: string): void {
    const limitations = this.limitations();
    limitations[newKey] = limitations[oldKey];
    delete limitations[oldKey];
  }

  remove(key: string): void {
    const limitations = this.limitations();
    delete limitations?.[key];
  }
}
