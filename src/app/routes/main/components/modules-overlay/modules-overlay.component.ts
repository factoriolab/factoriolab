import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';

import { OverlayComponent } from '~/components';
import { Machine, ModuleSettings } from '~/models';
import { LabState } from '~/store';

@Component({
  selector: 'lab-modules-overlay',
  templateUrl: './modules-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulesOverlayComponent extends OverlayComponent {
  store = inject(Store<LabState>);

  @Output() setValue = new EventEmitter<ModuleSettings[]>();

  machine = signal<Machine | undefined>(undefined);
  modules = signal<ModuleSettings[]>([]);
  recipeId = signal<string | undefined>(undefined);

  show(
    event: Event,
    values: ModuleSettings[],
    machine: Machine,
    recipeId?: string,
  ): void {
    this.machine.set(machine);
    this.modules.set(values);
    this.recipeId.set(recipeId);
    this._show(event);
  }

  save(): void {
    let values = this.modules();
    if (this.machine()?.modules !== true)
      values = values.filter((e) => e.count?.nonzero());
    this.setValue.emit(values);
  }
}
