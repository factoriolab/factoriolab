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
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  DisplayRate,
  ResearchSpeed,
  IdType,
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
  Column,
  DefaultIdPayload,
  DEFAULT_PRECISION,
} from '~/models';
import { ColumnsState } from '~/store/columns';
import { FactoriesState } from '~/store/factories';
import { PreferencesState } from '~/store/preferences';
import { SettingsState, initialSettingsState } from '~/store/settings';

enum OpenSelect {
  Mods,
  DisabledRecipes,
  Belt,
  Fuel,
}

export enum FactoryEditType {
  Factory,
  Module,
  Beacon,
  BeaconModule,
}

export interface FactoryEdit {
  id: string;
  type: FactoryEditType;
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
  @Input() factories: FactoriesState;
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
  @Output() addFactory = new EventEmitter<DefaultPayload<string, string[]>>();
  @Output() removeFactory = new EventEmitter<
    DefaultPayload<string, string[]>
  >();
  @Output() raiseFactory = new EventEmitter<DefaultPayload<string, string[]>>();
  @Output() lowerFactory = new EventEmitter<DefaultPayload<string, string[]>>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload<string, string[]>>();
  @Output() setModuleRank = new EventEmitter<IdPayload<string[]>>();
  @Output() setBeaconCount = new EventEmitter<IdPayload<number>>();
  @Output() setBeacon = new EventEmitter<IdPayload>();
  @Output() setBeaconModule = new EventEmitter<IdPayload>();
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
  @Output() reset = new EventEmitter();

  openSelect: OpenSelect;
  editFactory: FactoryEdit;
  initial = initialSettingsState;
  sortedFuels: string[] = [];
  state = '';
  editState = false;
  DEFAULT_PRECISION = DEFAULT_PRECISION;

  Column = Column;
  DisplayRate = DisplayRate;
  FactoryEditType = FactoryEditType;
  InserterCapacity = InserterCapacity;
  InserterTarget = InserterTarget;
  ItemId = ItemId;
  LinkValue = LinkValue;
  OpenSelect = OpenSelect;
  Preset = Preset;
  ResearchSpeed = ResearchSpeed;
  SelectType = IdType;
  Sort = Sort;

  get hash() {
    return location.hash.substr(1);
  }

  get factoryRows() {
    return ['', ...this.factories.ids];
  }

  get factoryOptions() {
    return this.data.factoryIds.filter(
      (f) => this.factories.ids.indexOf(f) === -1
    );
  }

  get element() {
    return this.el.nativeElement as HTMLElement;
  }

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private el: ElementRef
  ) {}

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

  changeBeaconCount(id: string, event: Event) {
    const target = event.target as HTMLInputElement;
    this.setBeaconCount.emit({
      id,
      value: Number(target.value),
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
