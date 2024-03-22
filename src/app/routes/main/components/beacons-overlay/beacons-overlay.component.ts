import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { OverlayPanel } from 'primeng/overlaypanel';

import { BeaconSettings, ItemId, ModuleSettings, Rational } from '~/models';
import { LabState, Settings } from '~/store';

@Component({
  selector: 'lab-beacons-overlay',
  templateUrl: './beacons-overlay.component.html',
  styleUrl: './beacons-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeaconsOverlayComponent {
  store = inject(Store<LabState>);

  @ViewChild(OverlayPanel) overlayPanel?: OverlayPanel;

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
    this.overlayPanel?.toggle(event);
  }

  setCount(count: string, i: number): void {
    this.values.update((values) => {
      values[i].count = count;
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
      values.push({ id, count: '1', modules });
      return values;
    });
  }

  onHide(): void {
    this.setValue.emit(this.values().filter((v) => v.count !== '0'));
  }
}
