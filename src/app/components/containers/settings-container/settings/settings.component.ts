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
  Preset,
  ItemId,
  Sort,
  LinkValue,
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
  @Output() disableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() enableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() setExpensive = new EventEmitter<boolean>();
  @Output() preferFactory = new EventEmitter<DefaultTogglePayload>();
  @Output() dropFactory = new EventEmitter<DefaultTogglePayload>();
  @Output() preferModule = new EventEmitter<DefaultTogglePayload>();
  @Output() dropModule = new EventEmitter<DefaultTogglePayload>();
  @Output() setDrillModule = new EventEmitter<boolean>();
  @Output() setBeacon = new EventEmitter<DefaultPayload>();
  @Output() setBeaconModule = new EventEmitter<DefaultPayload>();
  @Output() setBeaconCount = new EventEmitter<DefaultPayload<number>>();
  @Output() setBelt = new EventEmitter<DefaultPayload>();
  @Output() setFuel = new EventEmitter<DefaultPayload>();
  @Output() setFlowRate = new EventEmitter<number>();
  @Output() setDisplayRate = new EventEmitter<DisplayRate>();
  @Output() setItemPrecision = new EventEmitter<number>();
  @Output() setBeltPrecision = new EventEmitter<number>();
  @Output() setWagonPrecision = new EventEmitter<number>();
  @Output() setFactoryPrecision = new EventEmitter<number>();
  @Output() setPowerPrecision = new EventEmitter<number>();
  @Output() setPollutionPrecision = new EventEmitter<number>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();
  @Output() setSort = new EventEmitter<Sort>();
  @Output() setLinkValue = new EventEmitter<LinkValue>();
  @Output() setTheme = new EventEmitter<Theme>();
  @Output() resetSettings = new EventEmitter();

  openSelect = OpenSelect.None;

  DisplayRate = DisplayRate;
  ItemId = ItemId;
  LinkValue = LinkValue;
  OpenSelect = OpenSelect;
  Preset = Preset;
  ResearchSpeed = ResearchSpeed;
  SelectType = IdType;
  Sort = Sort;
  Theme = Theme;

  initial = initialSettingsState;
  sortedFuels: string[] = [];

  constructor(private ref: ChangeDetectorRef) {}

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll() {
    this.ref.detectChanges();
  }

  changeBeaconCount(event: Event) {
    const target = event.target as HTMLInputElement;
    this.setBeaconCount.emit({
      value: Number(target.value),
      default: this.data.defaults.beaconCount,
    });
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
