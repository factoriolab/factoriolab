import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  DisplayRate,
  ResearchSpeed,
  Dataset,
  ModInfo,
  DefaultPayload,
  Preset,
  ItemId,
  IdPayload,
  WARNING_RESET,
  InserterTarget,
  InserterCapacity,
  DefaultIdPayload,
  IdName,
  InserterCapacityOptions,
  ResearchSpeedOptions,
  InserterTargetOptions,
  DisplayRateOptions,
  FuelType,
  presetOptions,
  Rational,
  Game,
  GameOptions,
  PreviousPayload,
  PowerUnit,
  PowerUnitOptions,
  Column,
} from '~/models';
import { RouterService } from '~/services';
import { FactoriesState } from '~/store/factories';
import { ColumnsState, PreferencesState } from '~/store/preferences';
import { SettingsState, initialSettingsState } from '~/store/settings';
import { BrowserUtility } from '~/utilities';
import { Language } from '~/models/language';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnChanges {
  _data: Dataset;
  get data(): Dataset {
    return this._data;
  }
  @Input() set data(value: Dataset) {
    this._data = value;
    this.sortedFuels = value.fuelIds?.[FuelType.Chemical] || [];
  }
  @Input() base: ModInfo[];
  @Input() factories: FactoriesState;
  @Input() settings: SettingsState;
  @Input() preferences: PreferencesState;
  @Input() columns: ColumnsState;

  @Output() resetSettings = new EventEmitter();
  @Output() closeSettings = new EventEmitter();
  @Output() saveState = new EventEmitter<IdPayload>();
  @Output() removeState = new EventEmitter<string>();
  @Output() setPreset = new EventEmitter<Preset>();
  @Output() setBase = new EventEmitter<string>();
  @Output() setDisabledRecipes = new EventEmitter<DefaultPayload<string[]>>();
  @Output() setExpensive = new EventEmitter<boolean>();
  @Output() addFactory = new EventEmitter<DefaultPayload<string, string[]>>();
  @Output() removeFactory = new EventEmitter<
    DefaultPayload<string, string[]>
  >();
  @Output() raiseFactory = new EventEmitter<DefaultPayload<string, string[]>>();
  @Output() setFactory = new EventEmitter<DefaultIdPayload<string, string[]>>();
  @Output() setModuleRank = new EventEmitter<DefaultIdPayload<string[]>>();
  @Output() setBeaconCount = new EventEmitter<DefaultIdPayload<string>>();
  @Output() setBeacon = new EventEmitter<DefaultIdPayload>();
  @Output() setBeaconModule = new EventEmitter<DefaultIdPayload>();
  @Output() setOverclock = new EventEmitter<DefaultIdPayload<number>>();
  @Output() setBeaconReceivers = new EventEmitter<string>();
  @Output() setBelt = new EventEmitter<DefaultPayload>();
  @Output() setPipe = new EventEmitter<DefaultPayload>();
  @Output() setFuel = new EventEmitter<DefaultPayload>();
  @Output() setFlowRate = new EventEmitter<number>();
  @Output() setCargoWagon = new EventEmitter<DefaultPayload>();
  @Output() setFluidWagon = new EventEmitter<DefaultPayload>();
  @Output() setMiningBonus = new EventEmitter<number>();
  @Output() setResearchSpeed = new EventEmitter<ResearchSpeed>();
  @Output() setInserterTarget = new EventEmitter<InserterTarget>();
  @Output() setInserterCapacity = new EventEmitter<InserterCapacity>();
  @Output() setDisplayRate = new EventEmitter<PreviousPayload<DisplayRate>>();
  @Output() setColumns = new EventEmitter<ColumnsState>();
  @Output() setSimplex = new EventEmitter<boolean>();
  @Output() setLanguage = new EventEmitter<string>();
  @Output() setPowerUnit = new EventEmitter<PowerUnit>();
  @Output() setProliferatorSpray = new EventEmitter<string>();

  initial = initialSettingsState;
  sortedFuels: string[] = [];
  state = '';
  tempState = '';
  editState = false;
  difficultyOptions: IdName<boolean>[] = [
    {
      id: false,
      name: 'options.recipeDifficulty.normal',
    },
    {
      id: true,
      name: 'options.recipeDifficulty.expensive',
    },
  ];
  enabledOptions: IdName<boolean>[] = [
    {
      id: true,
      name: 'Enabled',
    },
    {
      id: false,
      name: 'Disabled',
    },
  ];
  languageOptions: Language[] = [
    {
      id: 'en',
      name: 'English',
    },
    {
      id: 'cn',
      name: '简体中文',
    }
  ];
  baseOptions: ModInfo[] = [];
  presetOptions: IdName<Preset>[];
  factoryOptions: string[];
  factoryRows: string[];
  savedStates: IdName[];
  columnsButton: string;
  GameOptions = GameOptions;
  ResearchSpeedOptions = ResearchSpeedOptions;
  InserterCapacityOptions = InserterCapacityOptions;
  InserterTargetOptions = InserterTargetOptions;
  DisplayRateOptions = DisplayRateOptions;
  PowerUnitOptions = PowerUnitOptions;
  BrowserUtility = BrowserUtility;

  ItemId = ItemId;
  Game = Game;
  Column = Column;

  ctrlFlowRate = new FormControl('', Validators.min(1));
  ctrlMiningProductivity = new FormControl('', Validators.min(0));
  ctrlMiningSpeed = new FormControl('', Validators.min(100));

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router,
    private routerSvc: RouterService,
    private translateSvc: TranslateService
  ) {}

  ngOnInit(): void {
    this.state =
      Object.keys(this.preferences.states).find(
        (s) => this.preferences.states[s] === BrowserUtility.search
      ) || '';
    this.router.events.subscribe((e) => this.ref.detectChanges());
  }

  ngOnChanges(): void {
    this.ctrlFlowRate.setValue(this.settings.flowRate);
    this.ctrlMiningProductivity.setValue(this.settings.miningBonus);
    this.ctrlMiningSpeed.setValue(this.settings.miningBonus + 100);

    this.presetOptions = presetOptions(this.data.game);
    this.factoryOptions = this.data.factoryIds.filter(
      (f) => this.factories.ids.indexOf(f) === -1
    );
    this.factoryRows = ['', ...this.factories.ids];
    this.savedStates = Object.keys(this.preferences.states).map((i) => ({
      id: i,
      name: i,
    }));
    const numCols = Object.keys(this.columns).filter(
      (c) => this.columns[c].show
    ).length;
    this.columnsButton = `${numCols} Visible`;
    this.baseOptions = this.base.filter((b) => b.game === this.data.game);
  }

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll(): void {
    this.ref.detectChanges();
  }

  setGame(game: Game): void {
    switch (game) {
      case Game.Factorio:
        this.setBase.emit(initialSettingsState.baseId);
        break;
      case Game.DysonSphereProgram:
        this.setBase.emit('dsp');
        break;
      case Game.Satisfactory:
        this.setBase.emit('sfy');
        break;
    }
  }

  changeBeaconCount(id: string, value: string): void {
    const def =
      id === ''
        ? this.data.defaults.beaconCount
        : this.factories.entities[''].beaconCount;
    this.setBeaconCount.emit({ id, value, def });
  }

  changeOverclock(id: string, input: Event): void {
    const target = input.target as HTMLInputElement;
    const value = target.valueAsNumber;
    if (value >= 1 && value <= 250) {
      const def = id === '' ? 100 : this.factories.entities[''].overclock;
      this.setOverclock.emit({ id, value, def });
    }
  }

  emitNumber(
    emitter: EventEmitter<number>,
    event: Event,
    min: number,
    offset = 0
  ): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value) + offset;
    if (value >= min) {
      emitter.emit(value);
    } else {
      emitter.emit(min);
    }
  }

  setState(id: string): void {
    const query = this.preferences.states[id];
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.state = id;
      this.router.navigate([], { queryParams });
    }
  }

  clickSaveState(): void {
    this.saveState.emit({ id: this.tempState, value: BrowserUtility.search });
    this.editState = false;
    this.state = this.tempState;
  }

  clickRemoveState(): void {
    this.removeState.emit(this.state);
    this.state = '';
  }

  toggleEditState(): void {
    this.editState = !this.editState;
    this.tempState = this.state;
  }

  clickResetSettings(): void {
    if (confirm(WARNING_RESET)) {
      localStorage.clear();
      this.resetSettings.emit();
    }
  }

  gtZero(value: string): boolean {
    try {
      return Rational.fromString(value).gt(Rational.zero);
    } catch {}
    return false;
  }

  toggleBeaconPower(): void {
    if (this.settings.beaconReceivers) {
      this.setBeaconReceivers.emit(null);
    } else {
      this.setBeaconReceivers.emit('1');
    }
  }

  changeLanguage($event: string): void {
    this.translateSvc.use($event);
    this.setLanguage.emit($event);
  }
}
