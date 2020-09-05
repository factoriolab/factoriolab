import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
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
  MODULE_ID,
  Preset,
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
  Beacon,
  BeaconModule,
}

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  _data: Dataset;
  get data() {
    return this._data;
  }
  @Input() set data(value: Dataset) {
    this._data = value;
    this.sortedFuels = [...value.fuelIds].sort((a, b) =>
      value.itemR[a].fuel.sub(value.itemR[b].fuel).toNumber()
    );
  }
  @Input() base: ModInfo[];
  @Input() mods: ModInfo[];
  @Input() settings: SettingsState;

  @Output() setPreset = new EventEmitter<Preset>();
  @Output() setBase = new EventEmitter<string>();
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
  @Output() setBeacon = new EventEmitter<DefaultPayload>();
  @Output() setBeaconModule = new EventEmitter<DefaultPayload>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();
  @Output() setPowerPrecision = new EventEmitter<number>();
  @Output() setPollutionPrecision = new EventEmitter<number>();
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
  Preset = Preset;
  MODULE_ID = MODULE_ID;

  initial = initialSettingsState;
  sortedFuels: string[] = [];

  constructor(private ref: ChangeDetectorRef) {}

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll() {
    this.ref.detectChanges();
  }

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
