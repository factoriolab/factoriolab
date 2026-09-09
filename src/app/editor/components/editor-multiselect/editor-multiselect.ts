import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  linkedSignal,
  model,
  viewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Control } from '~/components/control';
import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { Option } from '~/option/option';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-editor-multiselect',
  imports: [FormsModule, Icon, OptionPipe, Select, TranslatePipe],
  templateUrl: './editor-multiselect.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useFactory: (): Control => inject(EditorMultiselect).select(),
    },
    {
      provide: Control,
      useFactory: (): Control => inject(EditorMultiselect).select(),
    },
  ],
})
export class EditorMultiselect {
  readonly labelledBy = input<string>();
  readonly options = input.required<Option[]>();
  readonly value = model<string[]>();

  readonly select = viewChild.required(Select);
  protected readonly editValue = linkedSignal(() => this.value() ?? []);
}
