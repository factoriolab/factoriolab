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

import { OverlayComponent } from '~/components';
import {
  BeaconSettings,
  ItemId,
  ModuleSettings,
  rational,
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
  zero = rational(0n);

  show(event: Event, values: BeaconSettings[], recipeId?: string): void {
    this.values.set(
      values.map((v) => ({
        ...v,
        ...{ modules: v.modules?.map((m) => ({ ...m })) },
      })),
    );
    this.recipeId.set(recipeId);
    this._show(event);
  }

  setCount(i: number, count: Rational): void {
    this.values.update((values) => {
      values[i].count = count;
      return values;
    });
  }

  setId(i: number, event: DropdownChangeEvent): void {
    event.originalEvent.stopPropagation();
    this.values.update((values) => {
      values[i].id = event.value;
      return values;
    });
  }

  setModules(i: number, modules: ModuleSettings[]): void {
    this.values.update((values) => {
      values[i].modules = modules;
      return values;
    });
  }

  setTotal(i: number, total: Rational): void {
    this.values.update((values) => {
      values[i].total = total;
      return values;
    });
  }

  removeEntry(i: number): void {
    this.values.update((values) => values.filter((_, vi) => vi !== i));
  }

  addEntry(): void {
    this.values.update((values) => {
      const id = this.options().beacons[0].value;
      const count = this.data().beaconEntities[id].modules;
      const modules: ModuleSettings[] = [
        {
          id: ItemId.Module,
          count: count,
        },
      ];
      values.push({ id, count: rational(0n), modules });
      return values;
    });
  }

  save(): void {
    this.setValue.emit(this.values());
  }
}
