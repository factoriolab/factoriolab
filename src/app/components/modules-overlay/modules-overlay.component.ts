import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import { Machine, ModuleSettings } from '~/models';
import { TranslatePipe } from '~/pipes';

import { OverlayComponent } from '../modal';
import { ModulesComponent } from '../modules/modules.component';

@Component({
  selector: 'lab-modules-overlay',
  standalone: true,
  imports: [ButtonModule, OverlayPanelModule, ModulesComponent, TranslatePipe],
  templateUrl: './modules-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModulesOverlayComponent extends OverlayComponent {
  store = inject(Store);

  @Output() setValue = new EventEmitter<ModuleSettings[]>();

  machine = signal<Machine | undefined>(undefined);
  modules = signal<ModuleSettings[]>([]);
  recipeId = signal<string | undefined>(undefined);

  show(
    event: Event,
    modules: ModuleSettings[],
    machine: Machine,
    recipeId?: string,
  ): void {
    this.machine.set(machine);
    this.modules.set(modules.map((m) => ({ ...m })));
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
