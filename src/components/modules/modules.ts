import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { Beacon } from '~/data/schema/beacon';
import { Machine } from '~/data/schema/machine';
import { FilterOptionsPipe } from '~/option/filter-options-pipe';
import { Rational, rational } from '~/rational/rational';
import { ModuleSettings } from '~/state/module-settings';
import { Options } from '~/state/options';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce, notNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';

import { Button } from '../button/button';
import { InputNumber } from '../input-number/input-number';
import { Select } from '../select/select';
import { Tooltip } from '../tooltip/tooltip';

@Component({
  selector: 'lab-modules',
  imports: [
    FormsModule,
    Button,
    FilterOptionsPipe,
    InputNumber,
    Select,
    Tooltip,
    TranslatePipe,
  ],
  templateUrl: './modules.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex flex-col' },
})
export class Modules {
  private readonly options = inject(Options);
  private readonly settingsStore = inject(SettingsStore);

  readonly entity = input.required<Machine | Beacon>();
  readonly value = model.required<ModuleSettings[]>();
  readonly recipeId = input<string>();

  protected readonly exclude = computed(() =>
    this.value()
      .map((m) => m.id)
      .filter(notNullish),
  );
  private readonly sum = computed(() =>
    this.value()
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational.zero),
  );
  protected readonly moduleOptions = computed(() =>
    this.options.moduleOptions(
      this.entity(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
      this.recipeId(),
    ),
  );
  protected readonly maximum = computed(() => {
    const values = this.value();
    const slots = coalesce(this.entity().modules, rational.zero);
    if (slots === true) return values.map(() => undefined);
    let sum = this.sum();
    const empty = values.find((e) => e.id === '');
    if (empty) sum = sum.sub(coalesce(empty.count, rational.zero));
    const remain = slots.sub(sum);
    return values.map((e) => coalesce(e.count, rational.zero).add(remain));
  });

  protected readonly faXmark = faXmark;

  protected setCount(i: number, count: Rational): void {
    this.value.update((v) => {
      const modules = v.map((m, j) => (i === j ? spread(m, { count }) : m));
      this.updateEmpty(modules);
      return modules;
    });
  }

  protected setId(i: number, id: string): void {
    this.value.update((v) =>
      v.map((m, j) => (i === j ? spread(m, { id }) : m)),
    );
  }

  protected removeEntry(i: number): void {
    this.value.update((v) => {
      const modules = v.filter((_, j) => i !== j);
      this.updateEmpty(modules);
      return modules;
    });
  }

  protected updateEmpty(modules: ModuleSettings[]): void {
    const slots = this.entity().modules;
    if (slots === true || slots == null) return;
    const sum = modules
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational.zero);
    if (sum.lt(slots)) {
      const toAdd = slots.sub(sum);
      const empty = modules.find((e) => e.id === '');
      if (empty) {
        empty.count = coalesce(empty.count, rational.zero).add(toAdd);
      } else {
        modules.push({ id: '', count: toAdd });
      }
    } else if (sum.gt(slots)) {
      const toSubtract = sum.sub(slots);
      const empty = modules.find((e) => e.id === '');
      if (empty) {
        empty.count = coalesce(empty.count, rational.zero).sub(toSubtract);
        if (empty.count.isZero()) modules.splice(modules.indexOf(empty), 1);
      }
    }
  }
}
