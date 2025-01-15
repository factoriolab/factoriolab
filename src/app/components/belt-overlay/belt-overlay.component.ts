import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';

import { DropdownBaseDirective } from '~/directives/dropdown-base.directive';
import { spread } from '~/helpers';
import { Rational, rational } from '~/models/rational';
import { ItemSettings } from '~/models/settings/item-settings';
import { Optional } from '~/models/utils';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { SettingsService } from '~/store/settings.service';

import { InputNumberComponent } from '../input-number/input-number.component';
import { OverlayComponent } from '../modal';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-belt-overlay',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DropdownModule,
    OverlayPanelModule,
    TooltipModule,
    DropdownBaseDirective,
    IconSmClassPipe,
    InputNumberComponent,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './belt-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeltOverlayComponent extends OverlayComponent {
  settingsSvc = inject(SettingsService);

  setValue = output<ItemSettings>();

  maximum = signal(rational.zero);
  settings = signal<Optional<ItemSettings>>(undefined);

  options = this.settingsSvc.options;

  rational = rational;

  show(event: Event, stack: Rational, settings: ItemSettings): void {
    this.settings.set(spread(settings));
    this.maximum.set(stack);
    this._show(event);
  }

  setStack(stack: Rational): void {
    this.settings.update((settings) => spread(settings, { stack }));
  }

  setBelt(beltId: string): void {
    this.settings.update((settings) => spread(settings, { beltId }));
  }

  save(): void {
    const value = this.settings();
    if (value == null) return;
    this.setValue.emit(value);
  }
}
