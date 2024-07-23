import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { first } from 'rxjs';

import { coalesce } from '~/helpers';
import {
  AdjustedDataset,
  BeaconSettings,
  DisplayRate,
  displayRateOptions,
  Entities,
  FuelType,
  Game,
  gameInfo,
  gameOptions,
  IdValueDefaultPayload,
  IdValuePayload,
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
  ModuleSettings,
  PowerUnit,
  powerUnitOptions,
  Preset,
  rational,
  Rational,
  researchBonusOptions,
  Theme,
  themeOptions,
} from '~/models';
import { ContentService, RouterService } from '~/services';
import {
  App,
  Datasets,
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
  contentSvc = inject(ContentService);
  router = inject(Router);
  store = inject(Store<LabState>);
  translateSvc = inject(TranslateService);
  routerSvc = inject(RouterService);

  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  itemsState = this.store.selectSignal(Items.getItemsState);
  excludedItemIds = this.store.selectSignal(Items.getExcludedItemIds);
  recipesState = this.store.selectSignal(Recipes.getRecipesState);
  excludedRecipeIds = this.store.selectSignal(Recipes.getExcludedRecipeIds);
  itemIds = this.store.selectSignal(Recipes.getAvailableItems);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);
  machinesState = this.store.selectSignal(Machines.getMachinesState);
  settings = this.store.selectSignal(Settings.getSettings);
  columnsState = this.store.selectSignal(Settings.getColumnsState);
  options = this.store.selectSignal(Settings.getOptions);
  modOptions = this.store.selectSignal(Settings.getModOptions);
  presetOptions = this.store.selectSignal(Settings.getPresetOptions);
  researchedTechnologyIds = this.store.selectSignal(
    Settings.getAllResearchedTechnologyIds,
  );
  recipeIds = this.store.selectSignal(Settings.getAvailableRecipes);
  gameStates = this.store.selectSignal(Settings.getGameStates);
  savedStates = this.store.selectSignal(Settings.getSavedStates);
  preferences = this.store.selectSignal(Preferences.preferencesState);
  modRecord = this.store.selectSignal(Datasets.getModRecord);
  machineIds = computed(() => [
    ...(this.store.selectSignal(Machines.getMachinesState)().ids ?? []),
  ]);
  defaults = this.store.selectSignal(Settings.getDefaults);

  state = '';
  editValue = '';
  editState: 'create' | 'edit' | null = null;
  editStateMenu: MenuItem[] = [
    {
      label: this.translateSvc.instant('settings.createSavedState'),
      icon: 'fa-solid fa-plus',
      command: (): void => this.openCreateState(),
    },
    {
      label: this.translateSvc.instant('settings.saveSavedState'),
      icon: 'fa-solid fa-floppy-disk',
      command: (): void => this.overwriteState(),
    },
    {
      label: this.translateSvc.instant('settings.editSavedState'),
      icon: 'fa-solid fa-pencil',
      command: (): void => this.openEditState(),
    },
    {
      label: this.translateSvc.instant('settings.deleteSavedState'),
      icon: 'fa-solid fa-trash',
      command: (): void => this.clickDeleteState(),
    },
  ];
  versionsVisible = false;

  displayRateOptions = displayRateOptions;
  gameOptions = gameOptions;
  inserterCapacityOptions = inserterCapacityOptions;
  inserterTargetOptions = inserterTargetOptions;
  languageOptions = languageOptions;
  powerUnitOptions = powerUnitOptions;
  researchSpeedOptions = researchBonusOptions;
  themeOptions = themeOptions;
  maximizeTypeOptions = maximizeTypeOptions;

  FuelType = FuelType;
  Game = Game;
  ItemId = ItemId;
  BrowserUtility = BrowserUtility;
  rational = rational;

  ngOnInit(): void {
    this.store
      .select(Settings.getGameStates)
      .pipe(first())
      .subscribe((states) => {
        this.state = coalesce(
          Object.keys(states).find((s) => states[s] === BrowserUtility.search),
          '',
        );
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

  setState(id: string, states: Entities<string>): void {
    const query = states[id];
    if (query) {
      const queryParams = this.routerSvc.getParams(query);
      this.state = id;
      this.router.navigate([], { queryParams });
    }
  }

  clickSaveState(game: Game): void {
    if (!this.editValue || !this.editState) return;

    this.saveState(game, this.editValue, BrowserUtility.search);

    if (this.editState === 'edit' && this.state) {
      this.removeState(game, this.state);
    }

    this.editState = null;
    this.state = this.editValue;
  }

  openCreateState(): void {
    this.editValue = '';
    this.editState = 'create';
  }

  overwriteState(): void {
    this.store
      .select(Settings.getGame)
      .pipe(first())
      .subscribe((game) => {
        this.saveState(game, this.state, BrowserUtility.search);
      });
  }

  openEditState(): void {
    this.editValue = this.state;
    this.editState = 'edit';
  }

  clickDeleteState(): void {
    this.store
      .select(Settings.getGame)
      .pipe(first())
      .subscribe((game) => {
        this.removeState(game, this.state);
        this.state = '';
      });
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setExcludedRecipes(
    checked: string[],
    recipesState: Recipes.RecipesState,
    data: AdjustedDataset,
  ): void {
    const payload: IdValueDefaultPayload<boolean>[] = [];
    for (const id of data.recipeIds) {
      const value = checked.some((i) => i === id);
      if (value !== recipesState[id].excluded) {
        // Needs to change, find default value
        const def = coalesce(data.defaults?.excludedRecipeIds, []).some(
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
    data: AdjustedDataset,
  ): void {
    const payload: IdValuePayload<boolean>[] = [];
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
      coalesce(
        settings.fuelOptions?.map((o) => o.value),
        [],
      ),
      fuelRankIds,
    );
    this.setFuel(id, value, def);
  }

  changeModules(id: string, value: ModuleSettings[]): void {
    const state = this.machinesState();
    const machine = this.data().machineEntities[id];
    this.setModules(
      id,
      RecipeUtility.dehydrateModules(
        value,
        state.entities[id].moduleOptions ?? [],
        state.moduleRankIds,
        machine.modules,
      ),
    );
  }

  changeBeacons(id: string, value: BeaconSettings[]): void {
    const def = this.machinesState().beacons;
    this.setBeacons(id, RecipeUtility.dehydrateBeacons(value, def));
  }

  changeDefaultBeacons(value: BeaconSettings[]): void {
    const def = this.defaults()?.beacons;
    this.setDefaultBeacons(RecipeUtility.dehydrateBeacons(value, def));
  }

  toggleBeaconReceivers(value: boolean): void {
    this.setBeaconReceivers(value ? rational(1n) : null);
  }

  /** Action Dispatch Methods */
  resetSettings(): void {
    this.store.dispatch(new App.ResetAction());
  }

  saveState(key: Game, id: string, value: string): void {
    this.store.dispatch(new Preferences.SaveStateAction({ key, id, value }));
  }

  removeState(key: Game, id: string): void {
    this.store.dispatch(new Preferences.RemoveStateAction({ key, id }));
  }

  setMod(value: string): void {
    this.store.dispatch(new Settings.SetModAction(value));
  }

  setResearchedTechnologies(value: string[] | null): void {
    this.store.dispatch(new Settings.SetResearchedTechnologiesAction(value));
  }

  setRecipeExcludedBatch(payload: IdValueDefaultPayload<boolean>[]): void {
    this.store.dispatch(new Recipes.SetExcludedBatchAction(payload));
  }

  setItemExcludedBatch(payload: IdValuePayload<boolean>[]): void {
    this.store.dispatch(new Items.SetExcludedBatchAction(payload));
  }

  setPreset(value: Preset): void {
    this.store.dispatch(new Settings.SetPresetAction(value));
  }

  setFuelRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetFuelRankAction({ value, def }));
  }

  setModuleRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetModuleRankAction({ value, def }));
  }

  addMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.AddAction({ value, def }));
  }

  setDefaultBeacons(value: BeaconSettings[] | undefined): void {
    this.store.dispatch(new Machines.SetDefaultBeaconsAction(value));
  }

  setDefaultOverclock(value: Rational | undefined): void {
    this.store.dispatch(new Machines.SetDefaultOverclockAction(value));
  }

  setMachineRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetRankAction({ value, def }));
  }

  setMachine(id: string, value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetMachineAction({ id, value, def }));
  }

  setFuel(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(new Machines.SetFuelAction({ id, value, def }));
  }

  setModules(id: string, value: ModuleSettings[] | undefined): void {
    this.store.dispatch(new Machines.SetModulesAction({ id, value }));
  }

  setBeacons(id: string, value: BeaconSettings[] | undefined): void {
    this.store.dispatch(new Machines.SetBeaconsAction({ id, value }));
  }

  setOverclock(id: string, value: Rational, def: Rational | undefined): void {
    this.store.dispatch(new Machines.SetOverclockAction({ id, value, def }));
  }

  removeMachine(value: string, def: string[] | undefined): void {
    this.store.dispatch(new Machines.RemoveAction({ value, def }));
  }

  setBeaconReceivers(value: Rational | null): void {
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

  setFlowRate(value: Rational): void {
    this.store.dispatch(new Settings.SetFlowRateAction(value));
  }

  setInserterTarget(value: InserterTarget): void {
    this.store.dispatch(new Settings.SetInserterTargetAction(value));
  }

  setMiningBonus(value: Rational): void {
    this.store.dispatch(new Settings.SetMiningBonusAction(value));
  }

  setResearchSpeed(value: Rational): void {
    this.store.dispatch(new Settings.SetResearchBonusAction(value));
  }

  setInserterCapacity(value: InserterCapacity): void {
    this.store.dispatch(new Settings.SetInserterCapacityAction(value));
  }

  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
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

  setHideDuplicateIcons(value: boolean): void {
    this.store.dispatch(new Preferences.SetHideDuplicateIconsAction(value));
  }

  setDisablePaginator(value: boolean): void {
    this.store.dispatch(new Preferences.SetDisablePaginatorAction(value));
  }

  setMaximizeType(value: MaximizeType): void {
    this.store.dispatch(new Settings.SetMaximizeTypeAction(value));
  }

  setNetProductionOnly(value: boolean): void {
    this.store.dispatch(new Settings.SetNetProductionOnlyAction(value));
  }

  setSurplusMachinesOutput(value: boolean): void {
    this.store.dispatch(new Settings.SetSurplusMachinesOutputAction(value));
  }

  setConvertObjectiveValues(value: boolean): void {
    this.store.dispatch(new Preferences.SetConvertObjectiveValuesAction(value));
  }
}
