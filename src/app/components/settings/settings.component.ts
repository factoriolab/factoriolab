import { KeyValuePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AccordionModule } from 'primeng/accordion';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { first } from 'rxjs';

import {
  DropdownBaseDirective,
  DropdownTranslateDirective,
  NoDragDirective,
} from '~/directives';
import { coalesce } from '~/helpers';
import {
  BeaconSettings,
  DisplayRate,
  displayRateOptions,
  Entities,
  Game,
  gameInfo,
  gameOptions,
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
import { FilterOptionsPipe, IconSmClassPipe, TranslatePipe } from '~/pipes';
import { ContentService, RouterService, TranslateService } from '~/services';
import {
  App,
  Datasets,
  Items,
  Machines,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';
import { BeaconsOverlayComponent } from '../beacons-overlay/beacons-overlay.component';
import { CostsComponent } from '../costs/costs.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { ModulesOverlayComponent } from '../modules-overlay/modules-overlay.component';
import { PickerComponent } from '../picker/picker.component';
import { TechPickerComponent } from '../tech-picker/tech-picker.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'lab-settings',
  standalone: true,
  imports: [
    FormsModule,
    KeyValuePipe,
    NgClass,
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    MenuModule,
    MultiSelectModule,
    OrderListModule,
    ScrollPanelModule,
    TableModule,
    TooltipModule,
    BeaconsOverlayComponent,
    CostsComponent,
    DropdownBaseDirective,
    DropdownTranslateDirective,
    FilterOptionsPipe,
    IconSmClassPipe,
    InputNumberComponent,
    ModulesOverlayComponent,
    NoDragDirective,
    PickerComponent,
    TechPickerComponent,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  contentSvc = inject(ContentService);
  router = inject(Router);
  store = inject(Store);
  translateSvc = inject(TranslateService);
  routerSvc = inject(RouterService);

  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  itemsState = this.store.selectSignal(Items.selectItemsState);
  recipesState = this.store.selectSignal(Recipes.selectRecipesState);
  itemIds = this.store.selectSignal(Recipes.selectAvailableItems);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);
  machinesState = this.store.selectSignal(Machines.selectMachinesState);
  settings = this.store.selectSignal(Settings.selectSettings);
  columnsState = this.store.selectSignal(Settings.selectColumnsState);
  options = this.store.selectSignal(Settings.selectOptions);
  modOptions = this.store.selectSignal(Settings.selectModOptions);
  presetOptions = this.store.selectSignal(Settings.selectPresetOptions);
  researchedTechnologyIds = this.store.selectSignal(
    Settings.selectAllResearchedTechnologyIds,
  );
  recipeIds = this.store.selectSignal(Settings.selectAvailableRecipes);
  gameStates = this.store.selectSignal(Settings.selectGameStates);
  savedStates = this.store.selectSignal(Settings.selectSavedStates);
  preferences = this.store.selectSignal(Preferences.preferencesState);
  modRecord = this.store.selectSignal(Datasets.selectModEntities);
  machineIds = computed(() => [...this.settings().machineRankIds]);
  defaults = this.store.selectSignal(Settings.selectDefaults);

  state = '';
  editValue = '';
  editState: 'create' | 'edit' | null = null;
  editStateMenu: MenuItem[] = [
    {
      label: 'settings.createSavedState',
      icon: 'fa-solid fa-plus',
      command: (): void => this.openCreateState(),
    },
    {
      label: 'settings.saveSavedState',
      icon: 'fa-solid fa-floppy-disk',
      command: (): void => this.overwriteState(),
    },
    {
      label: 'settings.editSavedState',
      icon: 'fa-solid fa-pencil',
      command: (): void => this.openEditState(),
    },
    {
      label: 'settings.deleteSavedState',
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

  Game = Game;
  ItemId = ItemId;
  BrowserUtility = BrowserUtility;
  rational = rational;

  ngOnInit(): void {
    this.store
      .select(Settings.selectGameStates)
      .pipe(first())
      .subscribe((states) => {
        this.state = coalesce(
          Object.keys(states).find((s) => states[s] === BrowserUtility.search),
          '',
        );
      });
  }

  clickResetSettings(): void {
    this.translateSvc
      .multi(['settings.reset', 'settings.resetWarning', 'yes', 'cancel'])
      .pipe(first())
      .subscribe(([header, message, acceptLabel, rejectLabel]) => {
        this.contentSvc.confirm({
          icon: 'fa-solid fa-exclamation-triangle',
          header,
          message,
          acceptLabel,
          rejectLabel,
          accept: () => {
            localStorage.clear();
            this.resetSettings();
          },
        });
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
      .select(Settings.selectGame)
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
      .select(Settings.selectGame)
      .pipe(first())
      .subscribe((game) => {
        this.removeState(game, this.state);
        this.state = '';
      });
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  changeExcludedRecipes(value: Set<string>): void {
    this.setExcludedRecipes(
      value,
      new Set(coalesce(this.data().defaults?.excludedRecipeIds, [])),
    );
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
    this.setModules(
      id,
      RecipeUtility.dehydrateModules(
        value,
        coalesce(this.machinesState()[id].moduleOptions, []),
        this.settings().moduleRankIds,
        this.data().machineEntities[id].modules,
      ),
    );
  }

  changeBeacons(id: string, value: BeaconSettings[]): void {
    const def = this.settings().beacons;
    this.setBeacons(id, RecipeUtility.dehydrateBeacons(value, def));
  }

  changeDefaultBeacons(value: BeaconSettings[]): void {
    const def = this.defaults()?.beacons;
    this.setDefaultBeacons(RecipeUtility.dehydrateBeacons(value, def));
  }

  toggleBeaconReceivers(value: boolean): void {
    this.setBeaconReceivers(value ? rational.one : null);
  }

  addMachine(id: string, def: string[] | undefined): void {
    const ids = [...this.settings().machineRankIds];
    if (!ids.includes(id)) ids.push(id);
    this.setMachineRank(ids, def);
  }

  setMachine(id: string, value: string, def: string[] | undefined): void {
    const ids = [...this.settings().machineRankIds];
    const i = ids.indexOf(id);
    if (i !== -1) ids[i] = value;
    this.setMachineRank(ids, def);
  }

  removeMachine(id: string, def: string[] | undefined): void {
    const ids = this.settings().machineRankIds.filter((i) => i !== id);
    this.setMachineRank(ids, def);
  }

  /** Action Dispatch Methods */
  resetSettings(): void {
    this.store.dispatch(App.reset());
  }

  saveState(key: Game, id: string, value: string): void {
    this.store.dispatch(Preferences.saveState({ key, id, value }));
  }

  removeState(key: Game, id: string): void {
    this.store.dispatch(Preferences.removeState({ key, id }));
  }

  setMod(modId: string): void {
    this.store.dispatch(Settings.setMod({ modId }));
  }

  setResearchedTechnologies(researchedTechnologyIds: Set<string> | null): void {
    this.store.dispatch(
      Settings.setResearchedTechnologies({ researchedTechnologyIds }),
    );
  }

  setExcludedItems(excludedItemIds: Set<string>): void {
    this.store.dispatch(Settings.setExcludedItems({ excludedItemIds }));
  }

  setExcludedRecipes(value: Set<string>, def: Set<string>): void {
    this.store.dispatch(Settings.setExcludedRecipes({ value, def }));
  }

  setPreset(preset: Preset): void {
    this.store.dispatch(Settings.setPreset({ preset }));
  }

  setFuelRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(Settings.setFuelRank({ value, def }));
  }

  setModuleRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(Settings.setModuleRank({ value, def }));
  }

  setDefaultBeacons(beacons: BeaconSettings[] | undefined): void {
    this.store.dispatch(Settings.setBeacons({ beacons }));
  }

  setDefaultOverclock(overclock: Rational | undefined): void {
    this.store.dispatch(Settings.setOverclock({ overclock }));
  }

  setMachineRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(Settings.setMachineRank({ value, def }));
  }

  setFuel(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(Machines.setFuel({ id, value, def }));
  }

  setModules(id: string, value: ModuleSettings[] | undefined): void {
    this.store.dispatch(Machines.setModules({ id, value }));
  }

  setBeacons(id: string, value: BeaconSettings[] | undefined): void {
    this.store.dispatch(Machines.setBeacons({ id, value }));
  }

  setOverclock(id: string, value: Rational, def: Rational | undefined): void {
    this.store.dispatch(Machines.setOverclock({ id, value, def }));
  }

  setBeaconReceivers(beaconReceivers: Rational | null): void {
    this.store.dispatch(Settings.setBeaconReceivers({ beaconReceivers }));
  }

  setProliferatorSpray(proliferatorSprayId: string): void {
    this.store.dispatch(Settings.setProliferatorSpray({ proliferatorSprayId }));
  }

  setBelt(id: string, def: string | undefined): void {
    this.store.dispatch(Settings.setBelt({ id, def }));
  }

  setPipe(id: string, def: string | undefined): void {
    this.store.dispatch(Settings.setPipe({ id, def }));
  }

  setCargoWagon(id: string, def: string | undefined): void {
    this.store.dispatch(Settings.setCargoWagon({ id, def }));
  }

  setFluidWagon(id: string, def: string | undefined): void {
    this.store.dispatch(Settings.setFluidWagon({ id, def }));
  }

  setFlowRate(flowRate: Rational): void {
    this.store.dispatch(Settings.setFlowRate({ flowRate }));
  }

  setInserterTarget(inserterTarget: InserterTarget): void {
    this.store.dispatch(Settings.setInserterTarget({ inserterTarget }));
  }

  setMiningBonus(miningBonus: Rational): void {
    this.store.dispatch(Settings.setMiningBonus({ miningBonus }));
  }

  setResearchSpeed(researchBonus: Rational): void {
    this.store.dispatch(Settings.setResearchBonus({ researchBonus }));
  }

  setInserterCapacity(inserterCapacity: InserterCapacity): void {
    this.store.dispatch(Settings.setInserterCapacity({ inserterCapacity }));
  }

  setDisplayRate(displayRate: DisplayRate, previous: DisplayRate): void {
    this.store.dispatch(Settings.setDisplayRate({ displayRate, previous }));
  }

  setPowerUnit(powerUnit: PowerUnit): void {
    this.store.dispatch(Preferences.setPowerUnit({ powerUnit }));
  }

  setLanguage(language: Language): void {
    this.store.dispatch(Preferences.setLanguage({ language }));
  }

  setTheme(theme: Theme): void {
    this.store.dispatch(Preferences.setTheme({ theme }));
  }

  setBypassLanding(bypassLanding: boolean): void {
    this.store.dispatch(Preferences.setBypassLanding({ bypassLanding }));
  }

  setHideDuplicateIcons(hideDuplicateIcons: boolean): void {
    this.store.dispatch(
      Preferences.setHideDuplicateIcons({ hideDuplicateIcons }),
    );
  }

  setDisablePaginator(disablePaginator: boolean): void {
    this.store.dispatch(Preferences.setDisablePaginator({ disablePaginator }));
  }

  setMaximizeType(maximizeType: MaximizeType): void {
    this.store.dispatch(Settings.setMaximizeType({ maximizeType }));
  }

  setNetProductionOnly(netProductionOnly: boolean): void {
    this.store.dispatch(Settings.setNetProductionOnly({ netProductionOnly }));
  }

  setSurplusMachinesOutput(surplusMachinesOutput: boolean): void {
    this.store.dispatch(
      Settings.setSurplusMachinesOutput({ surplusMachinesOutput }),
    );
  }

  setConvertObjectiveValues(convertObjectiveValues: boolean): void {
    this.store.dispatch(
      Preferences.setConvertObjectiveValues({ convertObjectiveValues }),
    );
  }
}
