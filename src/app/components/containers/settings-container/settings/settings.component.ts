import { KeyValue } from '@angular/common';
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
  DefaultPayload,
  Preset,
  ItemId,
  Sort,
  LinkValue,
  IdPayload,
  WARNING_RESET,
  InserterTarget,
  InserterCapacity,
  DefaultColumnSettings,
  Column,
} from '~/models';
import { ColumnsState } from '~/store/columns';
import { PreferencesState } from '~/store/preferences';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
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
  @Input() columns: ColumnsState;
  @Input() preferences: PreferencesState;

  @Output() saveState = new EventEmitter<IdPayload>();
  @Output() deleteState = new EventEmitter<string>();
  @Output() setPreset = new EventEmitter<Preset>();
  @Output() setBase = new EventEmitter<string>();
  @Output() setMods = new EventEmitter<DefaultPayload<string[]>>();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();
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
  @Output() setPrecision = new EventEmitter<IdPayload<number>>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();
  @Output() setInserterTarget = new EventEmitter<InserterTarget>();
  @Output() setInserterCapacity = new EventEmitter<InserterCapacity>();
  @Output() setSort = new EventEmitter<Sort>();
  @Output() setLinkValue = new EventEmitter<LinkValue>();
  @Output() setTheme = new EventEmitter<Theme>();
  @Output() reset = new EventEmitter();

  openSelect: OpenSelect;

  Column = Column;
  DefaultColumnSettings = DefaultColumnSettings;
  DisplayRate = DisplayRate;
  InserterCapacity = InserterCapacity;
  InserterTarget = InserterTarget;
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
      Object.keys(this.preferences.states).find(
        (s) => this.preferences.states[s] === this.hash
      ) || '';
    this.router.events.subscribe((e) => this.ref.detectChanges());
  }

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll() {
    this.ref.detectChanges();
  }

  trackBy(data: KeyValue<string, string>) {
    return data.key;
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
    if (id && this.preferences.states[id]) {
      this.state = id;
      this.router.navigate([], { fragment: this.preferences.states[id] });
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
    if (confirm(WARNING_RESET)) {
      this.reset.emit();
    }
  }
}
