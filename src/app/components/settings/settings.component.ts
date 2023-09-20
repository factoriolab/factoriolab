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
  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  machineIds$ = this.store
    .select(Machines.getMachinesState)
    .pipe(map((state) => [...state.ids]));
  vm$ = combineLatest({
    itemsState: this.store.select(Items.getItemsState),
    excludedItemIds: this.store.select(Items.getExcludedItemIds),
    recipesState: this.store.select(Recipes.getRecipesState),
    excludedRecipeIds: this.store.select(Recipes.getExcludedRecipeIds),
    machinesState: this.store.select(Machines.getMachinesState),
    machineOptions: this.store.select(Machines.getMachineOptions),
    settings: this.store.select(Settings.getSettings),
    columnsState: this.store.select(Settings.getColumnsState),
    data: this.store.select(Settings.getDataset),
    options: this.store.select(Settings.getOptions),
    modOptions: this.store.select(Settings.getModOptions),
    presetOptions: this.store.select(Settings.getPresetOptions),
    beltSpeedTxt: this.store.select(Settings.getBeltSpeedTxt),
    dispRateInfo: this.store.select(Settings.getDisplayRateInfo),
    researchedTechnologyIds: this.store.select(
      Settings.getAllResearchedTechnologyIds,
    ),
    itemIds: this.store.select(Settings.getAvailableItems),
    recipeIds: this.store.select(Settings.getAvailableRecipes),
    gameStates: this.store.select(Settings.getGameStates),
    savedStates: this.store.select(Settings.getSavedStates),
    preferences: this.store.select(Preferences.preferencesState),
    modRecord: this.store.select(Datasets.getModRecord),
    machineIds: this.machineIds$,
  });

  state = '';
  editCtrl = new FormControl('', Validators.required);
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
      .select(Settings.getGameStates)
      .pipe(first())
      .subscribe((states) => {
        this.state =
          Object.keys(states).find(
            (s) => states[s] === BrowserUtility.search,
          ) ?? '';
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
    if (!this.editCtrl.value || !this.editState) return;

    this.saveState(game, this.editCtrl.value, BrowserUtility.search);

    if (this.editState === 'edit' && this.state) {
      this.removeState(game, this.state);
    }

    this.editState = null;
    this.state = this.editCtrl.value;
  }

  openCreateState(): void {
    this.editCtrl.setValue('');
    this.editCtrl.markAsPristine();
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
    this.editCtrl.setValue(this.state);
    this.editCtrl.markAsPristine();
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
    data: Dataset,
  ): void {
    const payload: IdValueDefaultPayload<boolean>[] = [];
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

  setItemExcludedBatch(payload: IdValuePayload<boolean>[]): void {
    this.store.dispatch(new Items.SetExcludedBatchAction(payload));
  }

  setRecipeExcludedBatch(payload: IdValueDefaultPayload<boolean>[]): void {
    this.store.dispatch(new Recipes.SetExcludedBatchAction(payload));
  }

  setNetProductionOnly(value: boolean): void {
    this.store.dispatch(new Settings.SetNetProductionOnlyAction(value));
  }

  setSurplusMachinesOutput(value: boolean): void {
    this.store.dispatch(new Settings.SetSurplusMachinesOutputAction(value));
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

  setMachineRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(new Machines.SetRankAction({ value, def }));
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

  setHideDuplicateIcons(value: boolean): void {
    this.store.dispatch(new Preferences.SetHideDuplicateIconsAction(value));
  }
}
