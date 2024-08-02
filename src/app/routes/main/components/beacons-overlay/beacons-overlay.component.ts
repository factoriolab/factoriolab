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
import { spread } from '~/helpers';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeaconsOverlayComponent extends OverlayComponent {
  store = inject(Store<LabState>);

  @Output() setValue = new EventEmitter<BeaconSettings[]>();

  data = this.store.selectSignal(Settings.getDataset);
  options = this.store.selectSignal(Settings.getOptions);

  beacons = signal<BeaconSettings[]>([]);
  recipeId = signal<string | undefined>(undefined);
  rational = rational;

  show(event: Event, values: BeaconSettings[], recipeId?: string): void {
    this.beacons.set(
      values.map((v) => ({
        ...v,
        ...{ modules: v.modules?.map((m) => ({ ...m })) },
      })),
    );
    this.recipeId.set(recipeId);
    this._show(event);
  }

  setCount(i: number, count: Rational): void {
    this.beacons.update((values) => {
      values[i].count = count;
      return values;
    });
  }

  setId(i: number, event: DropdownChangeEvent): void {
    event.originalEvent.stopPropagation();
    this.beacons.update((values) => {
      values[i].id = event.value;
      return values;
    });
  }

  setModules(i: number, modules: ModuleSettings[]): void {
    this.beacons.update((values) => {
      values[i].modules = modules;
      return values;
    });
  }

  setTotal(i: number, total: Rational): void {
    this.beacons.update((values) => {
      values[i].total = total;
      return values;
    });
  }

  removeEntry(i: number): void {
    this.beacons.update((values) => values.filter((_, vi) => vi !== i));
  }

  addEntry(): void {
    this.beacons.update((values) => {
      const id = this.options().beacons[0].value;
      const count = this.data().beaconEntities[id].modules;
      const modules: ModuleSettings[] = [
        {
          id: ItemId.Module,
          count: count,
        },
      ];
      values.push({ id, count: rational.zero, modules });
      return values;
    });
  }

  save(): void {
    const value = this.beacons().map((b) =>
      spread(b, { modules: b.modules?.filter((m) => m.count?.nonzero()) }),
    );
    this.setValue.emit(value);
  }
}
