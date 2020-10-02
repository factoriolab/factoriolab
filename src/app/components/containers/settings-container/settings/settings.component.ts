import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

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
  IdPayload,
  RESET_WARNING,
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
export class SettingsComponent implements OnInit {
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

  @Output() saveState = new EventEmitter<IdPayload>();
  @Output() deleteState = new EventEmitter<string>();
  @Output() setPreset = new EventEmitter<Preset>();
  @Output() setBase = new EventEmitter<string>();
  @Output() enableMod = new EventEmitter<DefaultTogglePayload>();
  @Output() disableMod = new EventEmitter<DefaultTogglePayload>();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();
  @Output() enableRecipe = new EventEmitter<DefaultTogglePayload>();
  @Output() setExpensive = new EventEmitter<boolean>();
  @Output() setFactoryRank = new EventEmitter<DefaultPayload<string[]>>();
  @Output() setModuleRank = new EventEmitter<DefaultPayload<string[]>>();
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
  state = '';
  editState = false;

  get hash() {
    return location.hash.substr(1);
  }

  constructor(private ref: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.state =
      Object.keys(this.settings.states).find(
        (s) => this.settings.states[s] === this.hash
      ) || '';
    this.router.events.subscribe((e) => this.ref.detectChanges());
  }

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll() {
    this.ref.detectChanges();
  }

  commitDisabledRecipes(value: string[]) {
    this.openSelect = OpenSelect.None;
    this.setDisabledRecipes.emit({
      value,
      default: this.data.defaults.disabledRecipes,
    });
  }

  commitFactoryRank(value: string[]) {
    this.openSelect = OpenSelect.None;
    this.setFactoryRank.emit({
      value,
      default: this.data.defaults.factoryRank,
    });
  }

  commitModuleRank(value: string[]) {
    this.openSelect = OpenSelect.None;
    this.setModuleRank.emit({
      value,
      default: this.data.defaults.moduleRank,
    });
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

  setState(event: Event) {
    const target = event.target as HTMLSelectElement;
    const id = target.value;
    if (id && this.settings.states[id]) {
      this.state = id;
      this.router.navigate([], { fragment: this.settings.states[id] });
    }
  }

  clickSaveState(event: Event) {
    this.saveState.emit({ id: this.state, value: this.hash });
    this.editState = false;
    event.stopPropagation();
  }

  clickDeleteState(event: Event) {
    this.deleteState.emit(this.state);
    this.state = '';
    event.stopPropagation();
  }

  toggleEditState(event: Event) {
    this.editState = !this.editState;
    event.stopPropagation();
  }

  clickResetSettings() {
    if (confirm(RESET_WARNING)) {
      this.resetSettings.emit();
    }
  }
}
