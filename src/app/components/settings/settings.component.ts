import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { combineLatest, first, map } from 'rxjs';

import {
  Dataset,
  Defaults,
  DisplayRate,
  displayRateOptions,
  FuelType,
  Game,
  gameInfo,
  gameOptions,
  IdDefaultPayload,
  IdPayload,
  InserterCapacity,
  inserterCapacityOptions,
  InserterTarget,
  inserterTargetOptions,
  ItemId,
  Language,
  languageOptions,
  MachineSettings,
  MaximizeType,
  maximizeTypeOptions,
  PowerUnit,
  powerUnitOptions,
  Preset,
  ResearchSpeed,
  researchSpeedOptions,
  Theme,
  themeOptions,
} from '~/models';
import { ContentService, DisplayService, RouterService } from '~/services';
import {
  App,
  Items,
  LabState,
  Machines,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';

@Component({
  selector: 'lab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  vm$ = combineLatest([
    this.store.select(Items.getItemsState),
    this.store.select(Recipes.getRecipesState),
    this.store.select(Machines.getMachinesState),
    this.store.select(Machines.getMachineRows),
    this.store.select(Machines.getMachineOptions),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getColumnsState),
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getModOptions),
    this.store.select(Settings.getPresetOptions),
    this.store.select(Settings.getBeltSpeedTxt),
    this.store.select(Settings.getDisplayRateInfo),
    this.store.select(Settings.getAllResearchedTechnologyIds),
    this.store.select(Settings.getAvailableItems),
    this.store.select(Settings.getAvailableRecipes),
    this.store.select(Preferences.preferencesState),
    this.store.select(Preferences.getSavedStates),
    this.contentSvc.lang$,
  ]).pipe(
    map(
      ([
        itemsState,
        recipesState,
        machinesState,
        machineRows,
        machineOptions,
        settings,
        columnsState,
        data,
        options,
        modOptions,
        presetOptions,
        beltSpeedTxt,
        dispRateInfo,
        researchedTechnologyIds,
        itemIds,
        recipeIds,
        preferences,
        savedStates,
      ]) => ({
        itemsState,
        recipesState,
        machinesState,
        machineRows,
        machineOptions,
        settings,
        columnsState,
        data,
        options,
        modOptions,
        presetOptions,
        beltSpeedTxt,
        dispRateInfo,
        researchedTechnologyIds,
        itemIds,
        recipeIds,
        preferences,
        savedStates,
        machineMenuItems: this.buildMachineMenus(machineRows, data),
        excludedItemIds: data.itemIds.filter((i) => itemsState[i]?.excluded),
        excludedRecipeIds: data.recipeIds.filter(
          (r) => recipesState[r]?.excluded,
        ),
        mod: modOptions.find((o) => o.value === settings.modId),
        preset: presetOptions.find((o) => o.value === settings.preset),
      }),
    ),
  );

  state = '';
  stateCtrl = new FormControl('', Validators.required);
  editState = false;
  versionsVisible = false;

  displayRateOptions = displayRateOptions;
  gameOptions = gameOptions;
  inserterCapacityOptions = inserterCapacityOptions;
  inserterTargetOptions = inserterTargetOptions;
  languageOptions = languageOptions;
  powerUnitOptions = powerUnitOptions;
  researchSpeedOptions = researchSpeedOptions;
  themeOptions = themeOptions;
  maximizeTypeOptions = maximizeTypeOptions;

  FuelType = FuelType;
  Game = Game;
  ItemId = ItemId;
  BrowserUtility = BrowserUtility;

  constructor(
    public contentSvc: ContentService,
    public displaySvc: DisplayService,
    private router: Router,
    private store: Store<LabState>,
    private translateSvc: TranslateService,
    private routerSvc: RouterService,
  ) {}

  ngOnInit(): void {
    this.store
      .select(Preferences.getStates)
      .pipe(first())
      .subscribe((states) => {
        this.state =
          Object.keys(states).find(
            (s) => states[s] === BrowserUtility.search,
          ) ?? '';
      });
  }

  buildMachineMenus(machineRows: string[], data: Dataset): MenuItem[][] {
    return machineRows.map((machineId, index): MenuItem[] => {
      if (!machineId) return [];
      const items: MenuItem[] = [];
      if (index > 1)
        items.push({
          label: this.translateSvc.instant('settings.moveUp'),
          icon: 'fa-solid fa-arrow-up',
          command: () =>
            this.raiseMachine(machineId, data.defaults?.machineRankIds),
        });
      if (index < machineRows.length - 1)
        items.push({
          label: this.translateSvc.instant('settings.moveDown'),
          icon: 'fa-solid fa-arrow-down',
          command: () =>
            this.lowerMachine(machineId, data.defaults?.machineRankIds),
        });
      return items;
    });
  }

  clickResetSettings(): void {
    this.contentSvc.confirm({
      icon: 'fa-solid fa-exclamation-triangle',
      header: this.translateSvc.instant('settings.reset'),
      message: this.translateSvc.instant('settings.resetWarning'),
      acceptLabel: this.translateSvc.instant('yes'),
      rejectLabel: this.translateSvc.instant('cancel'),
      accept: () => {
        localStorage.clear();
        this.resetSettings();
      },
    });
  }

  setSearch(search: string): void {
    const tree = this.router.parseUrl(this.router.url);
    const params = new URLSearchParams(search);
    params.forEach((value, key) => (tree.queryParams[key] = value));
    this.router.navigateByUrl(tree);
  }

  copySearchToClipboard(search: string): void {
    navigator.clipboard.writeText(search);
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
    if (this.stateCtrl.value) {
      this.saveState(this.stateCtrl.value, BrowserUtility.search);
      this.editState = false;
      this.state = this.stateCtrl.value;
    }
  }

  clickDeleteState(): void {
    this.removeState(this.state);
    this.state = '';
  }

  openEditState(): void {
    this.stateCtrl.setValue(this.state);
    this.stateCtrl.markAsPristine();
    this.editState = true;
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setExcludedRecipes(
    checked: string[],
    recipesState: Recipes.RecipesState,
    data: Dataset,
  ): void {
    const payload: IdDefaultPayload<boolean>[] = [];
    for (const id of data.recipeIds) {
      const value = checked.some((i) => i === id);
      if (value !== recipesState[id].excluded) {
        // Needs to change, find default value
        const def = (data.defaults?.excludedRecipeIds ?? []).some(
          (i) => i === id,
        );
        payload.push({ id, value, def });
      }
    }
    this.setRecipeExcludedBatch(payload);
  }

  setExcludedItems(
    checked: string[],
    itemsState: Items.ItemsState,
    data: Dataset,
  ): void {
    const payload: IdPayload<boolean>[] = [];
    for (const id of data.itemIds) {
      const value = checked.some((i) => i === id);
      if (value !== itemsState[id].excluded) {
        payload.push({ id, value });
      }
    }
    this.setItemExcludedBatch(payload);
  }

  changeFuel(
    id: string,
    value: string,
    settings: MachineSettings,
    fuelRankIds: string[],
  ): void {
    const def = RecipeUtility.bestMatch(
      settings.fuelOptions?.map((o) => o.value) ?? [],
      fuelRankIds,
    );
    this.setFuel(id, value, def);
  }

  changeBeaconModuleRank(
    id: string,
    value: string[],
    def: MachineSettings | Defaults,
  ): void {
    if (id === '') {
      this.setBeaconModuleRank(id, value, [(def as Defaults).beaconModuleId]);
    } else {
      this.setBeaconModuleRank(
        id,
        value,
        (def as MachineSettings).beaconModuleRankIds,
      );
    }
  }

  toggleBeaconReceivers(value: boolean): void {
    this.setBeaconReceivers(value ? '1' : null);
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

  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  setResearchedTechnologies(value: string[] | null): void {
    this.store.dispatch(new Settings.SetResearchedTechnologiesAction(value));
  }

  setItemExcludedBatch(payload: IdPayload<boolean>[]): void {
    this.store.dispatch(new Items.SetExcludedBatchAction(payload));
  }

  setRecipeExcludedBatch(payload: IdDefaultPayload<boolean>[]): void {
    this.store.dispatch(new Recipes.SetExcludedBatchAction(payload));
  }

  setNetProductionOnly(value: boolean): void {
    this.store.dispatch(new Settings.SetNetProductionOnlyAction(value));
  }

  setPreset(value: Preset): void {
    this.store.dispatch(new Settings.SetPresetAction(value));
  }

  addMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.AddAction({ value, def }));
  }

  removeMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.RemoveAction({ value, def }));
  }

  raiseMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.RaiseAction({ value, def }));
  }

  lowerMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.LowerAction({ value, def }));
  }

  setMachine(id: string, value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetMachineAction({ id, value, def }));
  }

  setFuel(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Machines.SetFuelAction({ id, value, def }));
  }

  setModuleRank(id: string, value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetModuleRankAction({ id, value, def }));
  }

  setOverclock(id: string, value: number, def: number | undefined): void {
    this.store.dispatch(new Machines.SetOverclockAction({ id, value, def }));
  }

  setBeaconCount(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Machines.SetBeaconCountAction({ id, value, def }));
  }

  setBeacon(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Machines.SetBeaconAction({ id, value, def }));
  }

  setBeaconModuleRank(
    id: string,
    value: string[],
    def: string[] | undefined,
  ): void {
    this.store.dispatch(
      new Machines.SetBeaconModuleRankAction({ id, value, def }),
    );
  }

  setBeaconReceivers(value: string | null): void {
    this.store.dispatch(new Settings.SetBeaconReceiversAction(value));
  }

  setProliferatorSpray(value: string): void {
    this.store.dispatch(new Settings.SetProliferatorSprayAction(value));
  }

  setBelt(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetBeltAction({ value, def }));
  }

  setPipe(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetPipeAction({ value, def }));
  }

  setCargoWagon(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetCargoWagonAction({ value, def }));
  }

  setFluidWagon(value: string, def: string | undefined): void {
    this.store.dispatch(new Settings.SetFluidWagonAction({ value, def }));
  }

  setFuels(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Settings.SetFuelRankAction({ value, def }));
  }

  setFlowRate(value: number): void {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
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

  setMaximizeType(value: MaximizeType): void {
    this.store.dispatch(new Settings.SetMaximizeTypeAction(value));
  }

  setPowerUnit(value: PowerUnit): void {
    this.store.dispatch(new Preferences.SetPowerUnitAction(value));
  }

  setLanguage(value: Language): void {
    this.translateSvc.use(value);
    this.store.dispatch(new Preferences.SetLanguageAction(value));
  }

  setTheme(value: Theme): void {
    this.store.dispatch(new Preferences.SetThemeAction(value));
  }

  setBypassLanding(value: boolean): void {
    this.store.dispatch(new Preferences.SetBypassLandingAction(value));
  }
}
