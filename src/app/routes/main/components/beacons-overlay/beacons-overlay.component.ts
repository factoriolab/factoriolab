import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DropdownChangeEvent } from 'primeng/dropdown';

import {
  BeaconSettings,
  ItemId,
  ModuleSettings,
  OverlayComponent,
  Rational,
} from '~/models';
import { LabState, Settings } from '~/store';

@Component({
  selector: 'lab-beacons-overlay',
  templateUrl: './beacons-overlay.component.html',
  styleUrl: './beacons-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeaconsOverlayComponent extends OverlayComponent {
  store = inject(Store<LabState>);

  @Output() setValue = new EventEmitter<BeaconSettings[]>();

  data = this.store.selectSignal(Settings.getDataset);
  options = this.store.selectSignal(Settings.getOptions);

  values = signal<BeaconSettings[]>([]);
  recipeId = signal<string | undefined>(undefined);

  show(event: Event, values: BeaconSettings[], recipeId?: string): void {
    this.values.set(
      values.map((v) => ({
        ...v,
        ...{ modules: v.modules.map((m) => ({ ...m })) },
      })),
    );
    this.recipeId.set(recipeId);
    this._show(event);
  }

  setCount(count: Rational, i: number): void {
    this.values.update((values) => {
      values[i].count = count;
      return values;
    });
  }

  setTotal(total: Rational, i: number): void {
    this.values.update((values) => {
      values[i].total = total;
      return values;
    });
  }

  setId(event: DropdownChangeEvent, i: number): void {
    event.originalEvent.stopPropagation();
    this.values.update((values) => {
      values[i].id = event.value;
      return values;
    });
  }

  setModules(modules: ModuleSettings[], i: number): void {
    this.values.update((values) => {
      values[i].modules = modules;
      return values;
    });
  }

  removeEntry(i: number): void {
    this.values.update((values) => values.filter((_, vi) => vi !== i));
  }

  addEntry(): void {
    this.values.update((values) => {
      const id = this.options().beacons[0].value;
      const count = Rational.fromNumber(this.data().beaconEntities[id].modules);
      const modules: ModuleSettings[] = [
        {
          id: ItemId.Module,
          count: count,
        },
      ];
      values.push({ id, count: Rational.zero, modules });
      return values;
    });
  }

  save(): void {
    this.setValue.emit(this.values());
  }
}
