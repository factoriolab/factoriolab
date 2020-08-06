import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';

import {
  DisplayRate,
  ResearchSpeed,
  IdType,
  Theme,
  Dataset,
  ModInfo,
  DefaultTogglePayload,
  DefaultPayload,
} from '~/models';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  None,
  Mods,
  DisabledRecipes,
  Belt,
  Fuel,
  Factory,
  Module,
  BeaconModule,
}

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  @Input() data: Dataset;
  @Input() base: ModInfo[];
  @Input() mods: ModInfo[];
  @Input() settings: SettingsState;

  @Output() setBaseDataset = new EventEmitter<string>();
  @Output() enableMod = new EventEmitter<DefaultTogglePayload>();
  @Output() disableMod = new EventEmitter<DefaultTogglePayload>();
  @Output() setBelt = new EventEmitter<DefaultPayload>();
  @Output() setFuel = new EventEmitter<DefaultPayload>();
  @Output() disableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() enableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() preferFactory = new EventEmitter<DefaultTogglePayload>();
  @Output() dropFactory = new EventEmitter<DefaultTogglePayload>();
  @Output() preferModule = new EventEmitter<DefaultTogglePayload>();
  @Output() dropModule = new EventEmitter<DefaultTogglePayload>();
  @Output() setBeaconModule = new EventEmitter<DefaultPayload>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();
  @Output() setBeaconCount = new EventEmitter<number>();
  @Output() setDrillModule = new EventEmitter<boolean>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();
  @Output() setFlowRate = new EventEmitter<number>();
  @Output() setExpensive = new EventEmitter<boolean>();
  @Output() setTheme = new EventEmitter<Theme>();

  openSelect = OpenSelect.None;

  DisplayRate = DisplayRate;
  OpenSelect = OpenSelect;
  ResearchSpeed = ResearchSpeed;
  SelectType = IdType;
  Theme = Theme;

  initial = initialSettingsState;

  constructor() {}

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll() {}

  emitNumber(emitter: EventEmitter<number>, event: any) {
    if (event.target.value) {
      const value = Math.round(Number(event.target.value));
      emitter.emit(value);
    }
  }

  emitString(emitter: EventEmitter<string>, event: any) {
    if (event.target.value) {
      emitter.emit(event.target.value);
    }
  }
}
