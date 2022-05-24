import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, first, map } from 'rxjs';

import {
  Column,
  Dataset,
  DisplayRate,
  DisplayRateOptions,
  Game,
  GameOptions,
  IdName,
  InserterCapacity,
  InserterCapacityOptions,
  InserterTarget,
  InserterTargetOptions,
  ItemId,
  Language,
  PowerUnit,
  PowerUnitOptions,
  Preset,
  ResearchSpeed,
  ResearchSpeedOptions,
  WARNING_RESET,
} from '~/models';
import { RouterService } from '~/services';
import { LabState } from '~/store';
import * as App from '~/store/app.actions';
import * as Factories from '~/store/factories';
import * as Preferences from '~/store/preferences';
import * as Settings from '~/store/settings';
import { BrowserUtility } from '~/utilities';

@UntilDestroy()
@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  @Output() closeSettings = new EventEmitter();

  vm$ = combineLatest([
    this.store.select(Factories.getFactories),
    this.store.select(Factories.getFactoryOptions),
    this.store.select(Factories.getFactoryRows),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getChemicalFuelIds),
    this.store.select(Settings.getPresetOptions),
    this.store.select(Settings.getModOptions),
    this.store.select(Settings.getColumnsState),
    this.store.select(Preferences.preferencesState),
    this.store.select(Preferences.getSavedStates),
    this.store.select(Preferences.getColumnsVisible),
  ]).pipe(
    map(
      ([
        factories,
        factoryOptionIds,
        factoryRows,
        settings,
        data,
        chemicalFuelIds,
        presetOptions,
        modOptions,
        columns,
        preferences,
        savedStates,
        columnsVisible,
      ]) => ({
        factories,
        factoryOptionIds,
        factoryRows,
        settings,
        data,
        chemicalFuelIds,
        presetOptions,
        columns,
        preferences,
        modOptions,
        savedStates,
        columnsVisible,
      })
    )
  );

  ctrlFlowRate = new FormControl('', Validators.min(1));
  ctrlMiningProductivity = new FormControl('', Validators.min(0));
  ctrlMiningSpeed = new FormControl('', Validators.min(100));
  state = '';
  tempState = '';
  editState = false;
  opening = true;

  initial = Settings.initialSettingsState;
  enabledOptions: IdName<boolean>[] = [
    {
      id: true,
      name: 'options.enabled',
    },
    {
      id: false,
      name: 'options.disabled',
    },
  ];
  languageOptions: Language[] = [
    {
      id: 'en',
      name: 'English',
    },
    {
      id: 'zh',
      name: '简体中文',
    },
  ];
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

  get isInOverlayMode(): boolean {
    return window
      .getComputedStyle(this.el.nativeElement)
      .marginRight.startsWith('-');
  }

  constructor(
    private el: ElementRef<HTMLElement>,
    private ref: ChangeDetectorRef,
    private router: Router,
    private translateSvc: TranslateService,
    private routerSvc: RouterService,
    private store: Store<LabState>
  ) {}

  ngOnInit(): void {
    this.store
      .select(Preferences.getStates)
      .pipe(first())
      .subscribe((states) => {
        this.state =
          Object.keys(states).find(
            (s) => states[s] === BrowserUtility.search
          ) || '';
      });

    this.store
      .select(Settings.getSettings)
      .pipe(untilDestroyed(this))
      .subscribe((settings) => {
        this.ctrlFlowRate.setValue(settings.flowRate);
        this.ctrlMiningProductivity.setValue(settings.miningBonus);
        this.ctrlMiningSpeed.setValue(settings.miningBonus + 100);
      });

    this.router.events.subscribe(() => this.ref.detectChanges());
  }

  /** Forces change detector to update on scroll */
  @HostListener('scroll', ['$event']) scroll(): void {
    this.ref.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  click(event: MouseEvent): void {
    if (this.opening) {
      this.opening = false;
    } else if (
      !this.el.nativeElement.contains(event.target as Node) &&
      document.contains(event.target as Node) &&
      this.isInOverlayMode
    ) {
      this.closeSettings.emit();
    }
  }

  setGame(game: Game): void {
    switch (game) {
      case Game.Factorio:
        this.setMod(Settings.initialSettingsState.modId);
        break;
      case Game.DysonSphereProgram:
        this.setMod('dsp');
        break;
      case Game.Satisfactory:
        this.setMod('sfy');
        break;
    }
  }

  changeBeaconCount(
    id: string,
    value: string,
    factories: Factories.FactoriesState,
    data: Dataset
  ): void {
    if (data.defaults != null) {
      const def =
        id === ''
          ? data.defaults.beaconCount
          : factories.entities[''].beaconCount;
      this.setBeaconCount(id, value, def);
    }
  }

  changeOverclock(
    id: string,
    input: Event,
    factories: Factories.FactoriesState
  ): void {
    const target = input.target as HTMLInputElement;
    const value = target.valueAsNumber;
    if (value >= 1 && value <= 250) {
      const def = id === '' ? 100 : factories.entities[''].overclock;
      this.setOverclock(id, value, def);
    }
  }

  emitNumber(
    field: 'miningBonus' | 'flowRate',
    event: Event,
    min: number,
    offset = 0
  ): void {
    const target = event.target as HTMLInputElement;
    let value = Number(target.value) + offset;
    value = Math.max(value, min);
    if (field === 'miningBonus') {
      this.setMiningBonus(value);
    } else {
      this.setFlowRate(value);
    }
  }

  setState(id: string, preferences: Preferences.PreferencesState): void {
    const query = preferences.states[id];
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.state = id;
      this.router.navigate([], { queryParams });
    }
  }

  clickSaveState(): void {
    this.saveState(this.tempState, BrowserUtility.search);
    this.editState = false;
    this.state = this.tempState;
  }

  clickRemoveState(): void {
    this.removeState(this.state);
    this.state = '';
  }

  toggleEditState(): void {
    this.editState = !this.editState;
    this.tempState = this.state;
  }

  clickResetSettings(): void {
    if (confirm(WARNING_RESET)) {
      localStorage.clear();
      this.resetSettings();
    }
  }

  toggleBeaconPower(settings: Settings.SettingsState): void {
    if (settings.beaconReceivers) {
      this.setBeaconReceivers(null);
    } else {
      this.setBeaconReceivers('1');
    }
  }

  changeLanguage(value: string): void {
    this.translateSvc.use(value);
    this.setLanguage(value);
  }

  /** Action Dispatch Methods */
  resetSettings(): void {
    this.store.dispatch(new App.ResetAction());
  }

  saveState(id: string, value: string): void {
    this.store.dispatch(new Preferences.SaveStateAction({ id, value }));
  }

  removeState(value: string): void {
    this.store.dispatch(new Preferences.RemoveStateAction(value));
  }

  setPreset(value: Preset): void {
    this.store.dispatch(new Settings.SetPresetAction(value));
  }

  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  setDisabledRecipes(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Settings.SetDisabledRecipesAction({ value, def }));
  }

  addFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.AddAction({ value, def }));
  }

  removeFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.RemoveAction({ value, def }));
  }

  raiseFactory(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.RaiseAction({ value, def }));
  }

  setFactory(id: string, value: string, def: string[] | undefined): void {
    this.store.dispatch(new Factories.SetFactoryAction({ id, value, def }));
  }

  setModuleRank(id: string, value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Factories.SetModuleRankAction({ id, value, def }));
  }

  setBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Factories.SetBeaconCountAction({ id, value, def }));
  }

  setBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Factories.SetBeaconAction({ id, value, def }));
  }

  setBeaconModule(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(
      new Factories.SetBeaconModuleAction({ id, value, def })
    );
  }

  setOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Factories.SetOverclockAction({ id, value, def }));
  }

  setBeaconReceivers(value: string | null): void {
    this.store.dispatch(new Settings.SetBeaconReceiversAction(value));
  }

  setBelt(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetBeltAction({ value, def }));
  }

  setPipe(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetPipeAction({ value, def }));
  }

  setFuel(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetFuelAction({ value, def }));
  }

  setFlowRate(value: number): void {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
  }

  setCargoWagon(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetCargoWagonAction({ value, def }));
  }

  setFluidWagon(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetFluidWagonAction({ value, def }));
  }

  setInserterTarget(value: InserterTarget): void {
    this.store.dispatch(new Settings.SetInserterTargetAction(value));
  }

  setMiningBonus(value: number): void {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: ResearchSpeed): void {
    this.store.dispatch(new Settings.SetResearchSpeedAction(value));
  }

  setInserterCapacity(value: InserterCapacity): void {
    this.store.dispatch(new Settings.SetInserterCapacityAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  setSimplex(value: boolean): void {
    this.store.dispatch(new Preferences.SetSimplexAction(value));
  }

  setLanguage(value: string): void {
    this.store.dispatch(new Preferences.SetLanguageAction(value));
  }

  setPowerUnit(value: PowerUnit): void {
    this.store.dispatch(new Preferences.SetPowerUnitAction(value));
  }

  setProliferatorSpray(value: string): void {
    this.store.dispatch(new Settings.SetProliferatorSprayAction(value));
  }
}
