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
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderListModule } from 'primeng/orderlist';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { first } from 'rxjs';

import { DropdownBaseDirective } from '~/directives/dropdown-base.directive';
import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { NoDragDirective } from '~/directives/no-drag.directive';
import { coalesce } from '~/helpers';
import { Entities } from '~/models/entities';
import { DisplayRate, displayRateOptions } from '~/models/enum/display-rate';
import { Game, gameOptions } from '~/models/enum/game';
import {
  InserterCapacity,
  inserterCapacityOptions,
} from '~/models/enum/inserter-capacity';
import {
  InserterTarget,
  inserterTargetOptions,
} from '~/models/enum/inserter-target';
import { ItemId } from '~/models/enum/item-id';
import { Language, languageOptions } from '~/models/enum/language';
import { MaximizeType, maximizeTypeOptions } from '~/models/enum/maximize-type';
import { PowerUnit, powerUnitOptions } from '~/models/enum/power-unit';
import { Preset } from '~/models/enum/preset';
import { researchBonusOptions } from '~/models/enum/research-bonus';
import { Theme, themeOptions } from '~/models/enum/theme';
import { gameInfo } from '~/models/game-info';
import { Optional } from '~/models/optional';
import { Rational, rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { MachineSettings } from '~/models/settings/machine-settings';
import { ModuleSettings } from '~/models/settings/module-settings';
import { FilterOptionsPipe } from '~/pipes/filter-options.pipe';
import { IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { RouterService } from '~/services/router.service';
import { TranslateService } from '~/services/translate.service';
import { reset } from '~/store/app.actions';
import { selectModEntities } from '~/store/datasets/datasets.selectors';
import { selectItemsState } from '~/store/items/items.selectors';
import {
  setBeacons,
  setFuel,
  setModules,
  setOverclock,
} from '~/store/machines/machines.actions';
import { selectMachinesState } from '~/store/machines/machines.selectors';
import {
  removeState,
  saveState,
  setBypassLanding,
  setConvertObjectiveValues,
  setDisablePaginator,
  setHideDuplicateIcons,
  setLanguage,
  setPowerUnit,
  setTheme,
} from '~/store/preferences/preferences.actions';
import { preferencesState } from '~/store/preferences/preferences.selectors';
import {
  selectAdjustedDataset,
  selectRecipesState,
} from '~/store/recipes/recipes.selectors';
import {
  setBeaconReceivers,
  setBeacons as setDefaultBeacons,
  setBelt,
  setCargoWagon,
  setDisplayRate,
  setExcludedItems,
  setExcludedRecipes,
  setFlowRate,
  setFluidWagon,
  setFuelRank,
  setInserterCapacity,
  setInserterTarget,
  setMachineRank,
  setMaximizeType,
  setMiningBonus,
  setModuleRank,
  setNetProductionOnly,
  setOverclock as setDefaultOverclock,
  setPipe,
  setPreset,
  setProliferatorSpray,
  setResearchBonus,
  setResearchedTechnologies,
  setSurplusMachinesOutput,
} from '~/store/settings/settings.actions';
import {
  selectAllResearchedTechnologyIds,
  selectColumnsState,
  selectDefaults,
  selectGame,
  selectGameStates,
  selectModOptions,
  selectOptions,
  selectPresetOptions,
  selectSavedStates,
  selectSettings,
} from '~/store/settings/settings.selectors';
import { BrowserUtility } from '~/utilities/browser.utility';
import { RecipeUtility } from '~/utilities/recipe.utility';

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
    InputTextModule,
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
  router = inject(Router);
  store = inject(Store);
  contentSvc = inject(ContentService);
  routerSvc = inject(RouterService);
  translateSvc = inject(TranslateService);

  @HostBinding('class.active') @Input() active = false;
  @HostBinding('class.hidden') @Input() hidden = false;

  itemsState = this.store.selectSignal(selectItemsState);
  recipesState = this.store.selectSignal(selectRecipesState);
  data = this.store.selectSignal(selectAdjustedDataset);
  machinesState = this.store.selectSignal(selectMachinesState);
  settings = this.store.selectSignal(selectSettings);
  columnsState = this.store.selectSignal(selectColumnsState);
  options = this.store.selectSignal(selectOptions);
  modOptions = this.store.selectSignal(selectModOptions);
  presetOptions = this.store.selectSignal(selectPresetOptions);
  researchedTechnologyIds = this.store.selectSignal(
    selectAllResearchedTechnologyIds,
  );
  gameStates = this.store.selectSignal(selectGameStates);
  savedStates = this.store.selectSignal(selectSavedStates);
  preferences = this.store.selectSignal(preferencesState);
  modRecord = this.store.selectSignal(selectModEntities);
  machineIds = computed(() => [...this.settings().machineRankIds]);
  defaults = this.store.selectSignal(selectDefaults);
  game = this.store.selectSignal(selectGame);

  state = '';
  editValue = '';
  editState: 'create' | 'edit' | null = null;
  editStateMenu: MenuItem[] = [
    {
      label: 'settings.createSavedState',
      icon: 'fa-solid fa-plus',
      command: (): void => {
        this.openCreateState();
      },
    },
    {
      label: 'settings.saveSavedState',
      icon: 'fa-solid fa-floppy-disk',
      command: (): void => {
        this.overwriteState();
      },
    },
    {
      label: 'settings.editSavedState',
      icon: 'fa-solid fa-pencil',
      command: (): void => {
        this.openEditState();
      },
    },
    {
      label: 'settings.deleteSavedState',
      icon: 'fa-solid fa-trash',
      command: (): void => {
        this.clickDeleteState();
      },
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
      .select(selectGameStates)
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
    void this.router.navigateByUrl(tree);
  }

  copySearchToClipboard(search: string): void {
    void navigator.clipboard.writeText(search);
  }

  setState(id: string, states: Entities): void {
    const query = states[id];
    if (!query) return;
    this.state = id;
    void this.router.navigate([], {
      queryParams: this.routerSvc.toParams(query),
    });
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
    this.saveState(this.game(), this.state, BrowserUtility.search);
  }

  openEditState(): void {
    this.editValue = this.state;
    this.editState = 'edit';
  }

  clickDeleteState(): void {
    this.removeState(this.game(), this.state);
    this.state = '';
  }

  setGame(game: Game): void {
    this.setMod(gameInfo[game].modId);
  }

  setMod(modId: string): void {
    void this.router.navigate([modId, 'list']);
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
    this.setBeaconReceivers(value ? rational.one : undefined);
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
    this.store.dispatch(reset());
  }

  saveState(key: Game, id: string, value: string): void {
    this.store.dispatch(saveState({ key, id, value }));
  }

  removeState(key: Game, id: string): void {
    this.store.dispatch(removeState({ key, id }));
  }

  setResearchedTechnologies(
    researchedTechnologyIds: Optional<Set<string>>,
  ): void {
    this.store.dispatch(setResearchedTechnologies({ researchedTechnologyIds }));
  }

  setExcludedItems(excludedItemIds: Set<string>): void {
    this.store.dispatch(setExcludedItems({ excludedItemIds }));
  }

  setExcludedRecipes(value: Set<string>, def: Set<string>): void {
    this.store.dispatch(setExcludedRecipes({ value, def }));
  }

  setPreset(preset: Preset): void {
    this.store.dispatch(setPreset({ preset }));
  }

  setFuelRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(setFuelRank({ value, def }));
  }

  setModuleRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(setModuleRank({ value, def }));
  }

  setDefaultBeacons(beacons: BeaconSettings[] | undefined): void {
    this.store.dispatch(setDefaultBeacons({ beacons }));
  }

  setDefaultOverclock(overclock: Rational | undefined): void {
    this.store.dispatch(setDefaultOverclock({ overclock }));
  }

  setMachineRank(value: string[], def: string[] | undefined): void {
    this.store.dispatch(setMachineRank({ value, def }));
  }

  setFuel(id: string, value: string, def: string | undefined): void {
    this.store.dispatch(setFuel({ id, value, def }));
  }

  setModules(id: string, value: ModuleSettings[] | undefined): void {
    this.store.dispatch(setModules({ id, value }));
  }

  setBeacons(id: string, value: BeaconSettings[] | undefined): void {
    this.store.dispatch(setBeacons({ id, value }));
  }

  setOverclock(id: string, value: Rational, def: Rational | undefined): void {
    this.store.dispatch(setOverclock({ id, value, def }));
  }

  setBeaconReceivers(beaconReceivers: Rational | undefined): void {
    this.store.dispatch(setBeaconReceivers({ beaconReceivers }));
  }

  setProliferatorSpray(proliferatorSprayId: string): void {
    this.store.dispatch(setProliferatorSpray({ proliferatorSprayId }));
  }

  setBelt(id: string, def: string | undefined): void {
    this.store.dispatch(setBelt({ id, def }));
  }

  setPipe(id: string, def: string | undefined): void {
    this.store.dispatch(setPipe({ id, def }));
  }

  setCargoWagon(id: string, def: string | undefined): void {
    this.store.dispatch(setCargoWagon({ id, def }));
  }

  setFluidWagon(id: string, def: string | undefined): void {
    this.store.dispatch(setFluidWagon({ id, def }));
  }

  setFlowRate(flowRate: Rational): void {
    this.store.dispatch(setFlowRate({ flowRate }));
  }

  setInserterTarget(inserterTarget: InserterTarget): void {
    this.store.dispatch(setInserterTarget({ inserterTarget }));
  }

  setMiningBonus(miningBonus: Rational): void {
    this.store.dispatch(setMiningBonus({ miningBonus }));
  }

  setResearchSpeed(researchBonus: Rational): void {
    this.store.dispatch(setResearchBonus({ researchBonus }));
  }

  setInserterCapacity(inserterCapacity: InserterCapacity): void {
    this.store.dispatch(setInserterCapacity({ inserterCapacity }));
  }

  setDisplayRate(displayRate: DisplayRate, previous: DisplayRate): void {
    this.store.dispatch(setDisplayRate({ displayRate, previous }));
  }

  setPowerUnit(powerUnit: PowerUnit): void {
    this.store.dispatch(setPowerUnit({ powerUnit }));
  }

  setLanguage(language: Language): void {
    this.store.dispatch(setLanguage({ language }));
  }

  setTheme(theme: Theme): void {
    this.store.dispatch(setTheme({ theme }));
  }

  setBypassLanding(bypassLanding: boolean): void {
    this.store.dispatch(setBypassLanding({ bypassLanding }));
  }

  setHideDuplicateIcons(hideDuplicateIcons: boolean): void {
    this.store.dispatch(setHideDuplicateIcons({ hideDuplicateIcons }));
  }

  setDisablePaginator(disablePaginator: boolean): void {
    this.store.dispatch(setDisablePaginator({ disablePaginator }));
  }

  setMaximizeType(maximizeType: MaximizeType): void {
    this.store.dispatch(setMaximizeType({ maximizeType }));
  }

  setNetProductionOnly(netProductionOnly: boolean): void {
    this.store.dispatch(setNetProductionOnly({ netProductionOnly }));
  }

  setSurplusMachinesOutput(surplusMachinesOutput: boolean): void {
    this.store.dispatch(setSurplusMachinesOutput({ surplusMachinesOutput }));
  }

  setConvertObjectiveValues(convertObjectiveValues: boolean): void {
    this.store.dispatch(setConvertObjectiveValues({ convertObjectiveValues }));
  }
}
