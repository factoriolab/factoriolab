import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { SelectItem } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';

import { coalesce, notNullish } from '~/helpers';
import {
  Beacon,
  ItemId,
  Machine,
  ModuleSettings,
  OverlayComponent,
  rational,
  Rational,
} from '~/models';
import { LabState, Settings } from '~/store';
import { RecipeUtility } from '~/utilities';

@Component({
  selector: 'lab-modules-overlay',
  templateUrl: './modules-overlay.component.html',
  styleUrl: './modules-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulesOverlayComponent extends OverlayComponent {
  store = inject(Store<LabState>);

  @Output() setValue = new EventEmitter<ModuleSettings[]>();

  data = this.store.selectSignal(Settings.getDataset);

  values = signal<ModuleSettings[]>([]);
  options = signal<SelectItem<string>[]>([]);
  slots = signal<Rational | true>(true);

  exclude = computed(() =>
    this.values()
      .map((m) => m.id)
      .filter(notNullish),
  );
  sum = computed(() =>
    this.values()
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational(0n)),
  );
  maximum = computed(() => {
    const values = this.values();
    const slots = this.slots();
    if (slots === true) return values.map(() => null);
    let sum = this.sum();
    const empty = values.find((e) => e.id === ItemId.Module);
    if (empty) sum = sum.sub(coalesce(empty.count, rational(0n)));
    const remain = slots.sub(sum);
    return values.map((e) => coalesce(e.count, rational(0n)).add(remain));
  });

  ItemId = ItemId;
  zero = rational(0n);

  show(
    event: Event,
    values: ModuleSettings[],
    entity: Machine | Beacon,
    recipeId?: string,
  ): void {
    const slots = entity.modules;
    if (slots == null) return;
    this.values.set(values);
    this.options.set(
      RecipeUtility.moduleOptions(entity, this.data(), recipeId),
    );
    this.slots.set(slots);
    this._show(event);
  }

  clone(values: ModuleSettings[]): ModuleSettings[] {
    return values.map((v) => ({ ...v }));
  }

  setCount(count: Rational, i: number): void {
    this.values.update((values) => {
      values = this.clone(values);
      values[i].count = count;
      this.updateEmpty(values);
      return values;
    });
  }

  setId(event: DropdownChangeEvent, i: number): void {
    event.originalEvent.stopPropagation();
    this.values.update((values) => {
      values = this.clone(values);
      values[i].id = event.value;
      return values;
    });
  }

  removeEntry(i: number): void {
    this.values.update((values) => {
      values = this.clone(values);
      values = values.filter((_, vi) => vi !== i);
      this.updateEmpty(values);
      return values;
    });
  }

  updateEmpty(values: ModuleSettings[]): void {
    const slots = this.slots();
    if (slots === true) return;
    const sum = values
      .map((m) => m.count)
      .filter(notNullish)
      .reduce((s, c) => s.add(c), rational(0n));
    if (sum.lt(slots)) {
      const toAdd = slots.sub(sum);
      const empty = values.find((e) => e.id === ItemId.Module);
      if (empty) {
        empty.count = coalesce(empty.count, rational(0n)).add(toAdd);
      } else {
        values.push({ id: ItemId.Module, count: toAdd });
      }
    } else if (sum.gt(slots)) {
      const toSubtract = sum.sub(slots);
      const empty = values.find((e) => e.id === ItemId.Module);
      if (empty) {
        empty.count = coalesce(empty.count, rational(0n)).sub(toSubtract);
        if (empty.count.isZero()) values.splice(values.indexOf(empty), 1);
      }
    }
  }

  save(): void {
    let values = this.values();
    if (this.slots() !== true)
      values = values.filter((e) => e.count?.nonzero());
    this.setValue.emit(values);
  }
}
