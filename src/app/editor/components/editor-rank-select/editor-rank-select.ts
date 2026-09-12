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

import { RankSelect } from '~/app/main/settings/rank-select/rank-select';
import { Control } from '~/components/control';
import { Icon } from '~/components/icon/icon';
import { Option } from '~/option/option';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-editor-rank-select',
  imports: [FormsModule, Icon, OptionPipe, RankSelect, TranslatePipe],
  templateUrl: './editor-rank-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useFactory: (): Control<string[]> =>
        inject(EditorRankSelect).rankSelect(),
    },
    {
      provide: Control,
      useFactory: (): Control<string[]> =>
        inject(EditorRankSelect).rankSelect(),
    },
  ],
})
export class EditorRankSelect {
  readonly labelledBy = input<string>();
  readonly options = input.required<Option[]>();
  readonly value = model<string[]>();
  readonly emptyMessage = input<string>();

  readonly rankSelect = viewChild.required(RankSelect);
  protected readonly editValue = linkedSignal(() => this.value() ?? []);
}
