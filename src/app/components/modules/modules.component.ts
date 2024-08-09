import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';

import { DropdownBaseDirective } from '~/directives';
import { coalesce, notNullish } from '~/helpers';
import {
  Beacon,
  ItemId,
  Machine,
  ModuleSettings,
  Rational,
  rational,
} from '~/models';
import { FilterOptionsPipe, IconSmClassPipe } from '~/pipes';
import { Settings } from '~/store';
import { RecipeUtility } from '~/utilities';
import { InputNumberComponent } from '../input-number/input-number.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-modules',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DropdownModule,
    TooltipModule,
    DropdownBaseDirective,
    FilterOptionsPipe,
    IconSmClassPipe,
    InputNumberComponent,
    TooltipComponent,
  ],
  templateUrl: './modules.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulesComponent {
  store = inject(Store);

  entity = input.required<Machine | Beacon>();
  modules = input.required<ModuleSettings[]>();
  recipeId = input<string>();

  setValue = output<ModuleSettings[]>();

  data = this.store.selectSignal(Settings.selectDataset);

  exclude = computed(() =>
    this.modules()
      .map((m) => m.id)
      .filter(notNullish),
  );
  sum = computed(() =>
    this.modules()
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational.zero),
  );
  options = computed(() => {
    return RecipeUtility.moduleOptions(
      this.entity(),
      this.data(),
      this.recipeId(),
    );
  });
  maximum = computed(() => {
    const values = this.modules();
    const slots = coalesce(this.entity().modules, rational.zero);
    if (slots === true) return values.map(() => null);
    let sum = this.sum();
    const empty = values.find((e) => e.id === ItemId.Module);
    if (empty) sum = sum.sub(coalesce(empty.count, rational.zero));
    const remain = slots.sub(sum);
    return values.map((e) => coalesce(e.count, rational.zero).add(remain));
  });

  rational = rational;
  ItemId = ItemId;

  setCount(i: number, count: Rational): void {
    const modules = this.modules().map((m, j) =>
      i === j ? { ...m, ...{ count } } : m,
    );
    this.updateEmpty(modules);
    this.setValue.emit(modules);
  }

  setId(i: number, event: DropdownChangeEvent): void {
    event.originalEvent.stopPropagation();
    const id = event.value;
    const modules = this.modules().map((m, j) =>
      i === j ? { ...m, ...{ id } } : m,
    );
    this.setValue.emit(modules);
  }

  removeEntry(i: number): void {
    const modules = this.modules().filter((_, j) => i !== j);
    this.updateEmpty(modules);
    this.setValue.emit(modules);
  }

  updateEmpty(modules: ModuleSettings[]): void {
    const slots = this.entity().modules;
    if (slots === true || slots == null) return;
    const sum = modules
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational.zero);
    if (sum.lt(slots)) {
      const toAdd = slots.sub(sum);
      const empty = modules.find((e) => e.id === ItemId.Module);
      if (empty) {
        empty.count = coalesce(empty.count, rational.zero).add(toAdd);
      } else {
        modules.push({ id: ItemId.Module, count: toAdd });
      }
    } else if (sum.gt(slots)) {
      const toSubtract = sum.sub(slots);
      const empty = modules.find((e) => e.id === ItemId.Module);
      if (empty) {
        empty.count = coalesce(empty.count, rational.zero).sub(toSubtract);
        if (empty.count.isZero()) modules.splice(modules.indexOf(empty), 1);
      }
    }
  }
}
