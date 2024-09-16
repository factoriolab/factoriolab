import {
  AsyncPipe,
  DOCUMENT,
  KeyValuePipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem, SortEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { Table, TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TooltipModule } from 'primeng/tooltip';
import { BehaviorSubject, combineLatest, filter, first, pairwise } from 'rxjs';

import { DropdownBaseDirective } from '~/directives/dropdown-base.directive';
import { NoDragDirective } from '~/directives/no-drag.directive';
import { coalesce, updateSetIds } from '~/helpers';
import { Entities } from '~/models/entities';
import { Game } from '~/models/enum/game';
import { ItemId } from '~/models/enum/item-id';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { stepDetailIcon, StepDetailTab } from '~/models/enum/step-detail-tab';
import { ObjectiveBase } from '~/models/objective';
import { Rational, rational } from '~/models/rational';
import { BeaconSettings } from '~/models/settings/beacon-settings';
import { ModuleSettings } from '~/models/settings/module-settings';
import { Step } from '~/models/step';
import { StepDetail } from '~/models/step-detail';
import { AsStepPipe } from '~/pipes/as-step.pipe';
import { IconClassPipe, IconSmClassPipe } from '~/pipes/icon-class.pipe';
import { InserterSpeedPipe } from '~/pipes/inserter-speed.pipe';
import { LeftPadPipe } from '~/pipes/left-pad.pipe';
import { MachineRatePipe } from '~/pipes/machine-rate.pipe';
import { MachineShowPipe } from '~/pipes/machine-show.pipe';
import { MachineShowRatePipe } from '~/pipes/machine-show-rate.pipe';
import { OptionsPipe } from '~/pipes/options.pipe';
import { PowerPipe } from '~/pipes/power.pipe';
import { RatePipe } from '~/pipes/rate.pipe';
import { StepHrefPipe } from '~/pipes/step-href.pipe';
import { StepIdPipe } from '~/pipes/step-id.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { ContentService } from '~/services/content.service';
import { ExportService } from '~/services/export.service';
import { RouterService } from '~/services/router.service';
import { TrackService } from '~/services/track.service';
import {
  resetBelts,
  resetItem,
  resetWagons,
  setBelt,
  setWagon,
} from '~/store/items/items.actions';
import {
  selectItemsModified,
  selectItemsState,
} from '~/store/items/items.selectors';
import { selectMachinesState } from '~/store/machines/machines.selectors';
import {
  add,
  resetObjective,
  setBeacons as setObjectiveBeacons,
  setFuel as setObjectiveFuel,
  setMachine as setObjectiveMachine,
  setModules as setObjectiveModules,
  setOverclock as setObjectiveOverclock,
} from '~/store/objectives/objectives.actions';
import {
  selectEffectivePowerUnit,
  selectRecipesModified,
  selectStepById,
  selectStepByItemEntities,
  selectStepDetails,
  selectSteps,
  selectStepsModified,
  selectStepTree,
  selectTotals,
} from '~/store/objectives/objectives.selectors';
import { setRows } from '~/store/preferences/preferences.actions';
import { preferencesState } from '~/store/preferences/preferences.selectors';
import {
  resetBeacons,
  resetMachines,
  resetRecipe,
  setBeacons as setRecipeBeacons,
  setFuel as setRecipeFuel,
  setMachine as setRecipeMachine,
  setModules as setRecipeModules,
  setOverclock as setRecipeOverclock,
} from '~/store/recipes/recipes.actions';
import {
  selectAdjustedDataset,
  selectRecipesState,
} from '~/store/recipes/recipes.selectors';
import {
  resetChecked,
  resetExcludedItems,
  setCheckedItems,
  setCheckedObjectives,
  setCheckedRecipes,
  setExcludedItems,
  setExcludedRecipes,
} from '~/store/settings/settings.actions';
import {
  selectBeltSpeed,
  selectColumnsState,
  selectDisplayRateInfo,
  selectOptions,
  selectSettings,
} from '~/store/settings/settings.selectors';
import { BrowserUtility } from '~/utilities/browser.utility';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { BeaconsOverlayComponent } from '../beacons-overlay/beacons-overlay.component';
import { ColumnsComponent } from '../columns/columns.component';
import { ModulesOverlayComponent } from '../modules-overlay/modules-overlay.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

export type StepsMode = 'all' | 'focus';

@Component({
  selector: 'lab-steps',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    KeyValuePipe,
    NgTemplateOutlet,
    RouterLink,
    ButtonModule,
    CheckboxModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    TabMenuModule,
    TooltipModule,
    AsStepPipe,
    BeaconsOverlayComponent,
    ColumnsComponent,
    DropdownBaseDirective,
    IconClassPipe,
    IconSmClassPipe,
    InserterSpeedPipe,
    DropdownBaseDirective,
    LeftPadPipe,
    MachineRatePipe,
    MachineShowPipe,
    MachineShowRatePipe,
    ModulesOverlayComponent,
    NoDragDirective,
    OptionsPipe,
    PowerPipe,
    RatePipe,
    StepHrefPipe,
    StepIdPipe,
    TooltipComponent,
    TranslatePipe,
  ],
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepsComponent implements OnInit, AfterViewInit {
  document = inject(DOCUMENT);
  route = inject(ActivatedRoute);
  ref = inject(ChangeDetectorRef);
  contentSvc = inject(ContentService);
  trackSvc = inject(TrackService);
  store = inject(Store);
  exportSvc = inject(ExportService);
  routerSvc = inject(RouterService);

  focus = input(false);
  selectedId = input<string | null>();
  steps = computed(() => {
    const steps = [...this.store.selectSignal(selectSteps)()];
    const focus = this.focus();
    if (!focus) return steps;
    const selectedId = this.selectedId();
    return steps.filter((s) => s.id === selectedId);
  });
  activeItemsEffect = effect(() => {
    const steps = this.steps();
    const stepDetails = this.store.selectSignal(selectStepDetails)();
    this.setActiveItems(steps, stepDetails);
  });
  toggleEffect = effect(() => {
    const focus = this.focus();
    const step = this.steps()[0];
    if (focus && step) {
      this.stepsTable().toggleRow(step);
      this.expandRow(step, false);
    }
  });

  machinesState = this.store.selectSignal(selectMachinesState);
  itemsState = this.store.selectSignal(selectItemsState);
  itemsModified = this.store.selectSignal(selectItemsModified);
  stepsModified = this.store.selectSignal(selectStepsModified);
  totals = this.store.selectSignal(selectTotals);
  stepDetails = this.store.selectSignal(selectStepDetails);
  stepById = this.store.selectSignal(selectStepById);
  stepByItemEntities = this.store.selectSignal(selectStepByItemEntities);
  stepTree = this.store.selectSignal(selectStepTree);
  effectivePowerUnit = this.store.selectSignal(selectEffectivePowerUnit);
  recipesState = this.store.selectSignal(selectRecipesState);
  recipesModified = this.store.selectSignal(selectRecipesModified);
  data = this.store.selectSignal(selectAdjustedDataset);
  columnsState = this.store.selectSignal(selectColumnsState);
  settings = this.store.selectSignal(selectSettings);
  dispRateInfo = this.store.selectSignal(selectDisplayRateInfo);
  options = this.store.selectSignal(selectOptions);
  beltSpeed = this.store.selectSignal(selectBeltSpeed);
  preferences = this.store.selectSignal(preferencesState);

  sortSteps$ = new BehaviorSubject<SortEvent | null>(null);

  stepsTable = viewChild.required<Table>('stepsTable');

  activeItem: Entities<MenuItem> = {};
  fragmentId: string | null | undefined;
  stepDetailIcon = stepDetailIcon;

  ItemId = ItemId;
  StepDetailTab = StepDetailTab;
  Game = Game;
  ObjectiveUnit = ObjectiveUnit;
  rational = rational;

  constructor() {
    combineLatest([
      this.sortSteps$.pipe(pairwise()),
      this.store.select(selectSteps),
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([[prev, curr], steps]) => {
        this.sortSteps(prev, curr, steps);
      });
  }

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        first(),
        filter((f) => f != null),
      )
      .subscribe((id) => {
        // Store the fragment to navigate to it after the component loads
        this.fragmentId = id;
      });
  }

  ngAfterViewInit(): void {
    // Now that component is loaded, try navigating to the fragment
    try {
      if (this.fragmentId) {
        const fragment = this.fragmentId;
        const [_, stepId, tabId] = fragment.split('_');
        combineLatest({
          steps: this.store.select(selectSteps),
          stepDetails: this.store.select(selectStepDetails),
        })
          .pipe(first())
          .subscribe(({ steps, stepDetails }) => {
            const step = steps.find((s) => s.id === stepId);
            if (step) {
              const tabs = stepDetails[step.id].tabs;
              if (tabs.length) {
                if (this.stepsTable) {
                  this.stepsTable().toggleRow(step);
                  setTimeout(() => {
                    if (tabId) {
                      const tab = this.document.querySelector<HTMLElement>(
                        `#${fragment}`,
                      );
                      if (tab) tab.click();
                    } else {
                      this.document
                        .querySelector(`#${fragment}`)
                        ?.scrollIntoView();
                    }
                  }, 10);
                }
              }
            }
          });
      }
    } catch {
      // ignore error
    }
  }

  sortSteps(
    prev: SortEvent | null,
    curr: SortEvent | null,
    steps: Step[],
  ): void {
    if (curr?.order == null || curr.field == null) return;
    const order = curr.order;
    const field = curr.field as
      | 'items'
      | 'belts'
      | 'wagons'
      | 'machines'
      | 'power'
      | 'pollution';

    if (
      prev != null &&
      prev.field === field &&
      prev.order !== order &&
      order === -1 &&
      this.stepsTable != null
    ) {
      /**
       * User has sorted the same column three times in a row. Reset sort and
       * reset table state, otherwise PrimeNG will not ever reset sort.
       */
      curr.data?.sort((a: Step, b: Step) => {
        const diff = steps.indexOf(a) - steps.indexOf(b);
        return diff;
      });
      this.stepsTable().sortOrder = 0;
      this.stepsTable().sortField = '';
      this.stepsTable().reset();
      this.sortSteps$.next(null);
      return;
    }

    // Sort by numeric field
    curr.data?.sort((a: Step, b: Step) => {
      const diff = (a[field] ?? rational.zero).sub(b[field] ?? rational.zero);
      return diff.toNumber() * order;
    });
  }

  setActiveItems(steps: Step[], stepDetails: Entities<StepDetail>): void {
    steps.forEach((step) => {
      this.updateActiveItem(step, stepDetails, false);
    });
  }

  expandRow(step: Step, expanded: boolean): void {
    if (expanded) return;
    this.updateActiveItem(step, this.stepDetails(), true);
  }

  updateActiveItem(
    step: Step,
    stepDetails: Entities<StepDetail>,
    force: boolean,
  ): void {
    const id = StepIdPipe.transform(step);
    const item = this._getActiveItem(step, id, stepDetails, force);
    if (item) {
      const id = StepIdPipe.transform(step);
      this.activeItem[id] = item;
    }
  }

  private _getActiveItem(
    step: Step,
    id: string,
    stepDetails: Entities<StepDetail>,
    force: boolean,
  ): MenuItem | null | undefined {
    const old = this.activeItem[id];
    const detail = stepDetails[step.id];

    if (detail == null) return null;

    if (old != null) {
      const match = detail.tabs.find((t) => t.label === old.label);
      if (match != null) return match;
    }

    if (old == null && !force) return null;

    const userTab = BrowserUtility.stepDetailTab;
    if (userTab) {
      const match = detail.tabs.find((t) => t.label === userTab);
      if (match != null) return match;
    }

    return detail.tabs[0];
  }

  setActiveItem(step: Step, item: MenuItem | null | undefined): void {
    if (item == null) return;
    const id = StepIdPipe.transform(step);
    this.activeItem[id] = item;
    BrowserUtility.stepDetailTab = item.label as StepDetailTab;
  }

  resetStep(step: Step): void {
    if (step.itemId) {
      this.resetItem(step.itemId);
    }

    if (step.recipeObjectiveId) {
      this.resetRecipeObjective(step.recipeObjectiveId);
    } else if (step.recipeId) {
      this.resetRecipe(step.recipeId);
    }
  }

  changeItemExcluded(id: string, value: boolean): void {
    this.setExcludedItems(
      updateSetIds(id, value, this.settings().excludedItemIds),
    );
  }

  changeRecipesExcluded(ids: string[], value: boolean): void {
    this.setExcludedRecipes(
      updateSetIds(ids, value, this.settings().excludedRecipeIds),
      new Set(coalesce(this.data().defaults?.excludedRecipeIds, [])),
    );
  }

  changeRecipeField(
    step: Step,
    event: string | number | ModuleSettings[] | BeaconSettings[],
    field: 'machine' | 'fuel' | 'modules' | 'beacons' | 'overclock',
  ): void {
    if (step.recipeId == null) return;

    const settings = step.recipeSettings;
    if (settings?.machineId == null) return;

    const id = step.recipeObjectiveId ?? step.recipeId;
    const isObjective = step.recipeObjectiveId != null;
    const machinesState = this.machinesState();
    const settingsState = this.settings();
    const machineSettings = machinesState[settings.machineId];
    switch (field) {
      case 'machine': {
        if (typeof event !== 'string') return;
        const data = this.data();
        this.setMachine(
          id,
          event,
          RecipeUtility.bestMatch(
            data.recipeEntities[step.recipeId].producers,
            settingsState.machineRankIds,
          ),
          isObjective,
        );
        break;
      }
      case 'fuel': {
        if (typeof event !== 'string') return;
        this.setFuel(id, event, machineSettings.fuelId, isObjective);
        break;
      }
      case 'modules': {
        if (!Array.isArray(event)) return;
        event = event as ModuleSettings[];
        const machine = this.data().machineEntities[settings.machineId];
        this.setModules(
          id,
          RecipeUtility.dehydrateModules(
            event,
            coalesce(settings.moduleOptions, []),
            settingsState.moduleRankIds,
            machine.modules,
            machineSettings.modules,
          ),
          isObjective,
        );
        break;
      }
      case 'beacons': {
        if (!Array.isArray(event)) return;
        event = event as BeaconSettings[];
        const def = machineSettings.beacons;
        this.setBeacons(
          id,
          RecipeUtility.dehydrateBeacons(event, def),
          isObjective,
        );

        break;
      }
      case 'overclock': {
        if (typeof event !== 'number') return;
        const def = machineSettings.overclock;
        this.setOverclock(id, rational(event), def, isObjective);
        break;
      }
    }
  }

  changeStepChecked(step: Step, value: boolean): void {
    // Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
    if (step.itemId != null) {
      this.setCheckedItems(
        updateSetIds(step.itemId, value, this.settings().checkedItemIds),
      );
    } else if (step.recipeObjectiveId != null) {
      this.setCheckedObjectives(
        updateSetIds(
          step.recipeObjectiveId,
          value,
          this.settings().checkedObjectiveIds,
        ),
      );
    } else if (step.recipeId != null) {
      this.setCheckedRecipes(
        updateSetIds(step.recipeId, value, this.settings().checkedRecipeIds),
      );
    }
  }

  /** Action Dispatch Methods */
  setRows(rows: number): void {
    this.store.dispatch(setRows({ rows }));
  }

  setExcludedItems(excludedItemIds: Set<string>): void {
    this.store.dispatch(setExcludedItems({ excludedItemIds }));
  }

  setBelt(id: string, value: string, def: string): void {
    this.store.dispatch(setBelt({ id, value, def }));
  }

  setWagon(id: string, value: string, def: string): void {
    this.store.dispatch(setWagon({ id, value, def }));
  }

  setExcludedRecipes(value: Set<string>, def: Set<string>): void {
    this.store.dispatch(setExcludedRecipes({ value, def }));
  }

  addObjective(objective: ObjectiveBase): void {
    this.store.dispatch(add({ objective }));
  }

  setMachine(id: string, value: string, def: string, objective = false): void {
    const action = objective ? setObjectiveMachine : setRecipeMachine;
    this.store.dispatch(action({ id, value, def }));
  }

  setFuel(
    id: string,
    value: string,
    def: string | undefined,
    objective = false,
  ): void {
    const action = objective ? setObjectiveFuel : setRecipeFuel;
    this.store.dispatch(action({ id, value, def }));
  }

  setModules(
    id: string,
    value: ModuleSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective ? setObjectiveModules : setRecipeModules;
    this.store.dispatch(action({ id, value }));
  }

  setBeacons(
    id: string,
    value: BeaconSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective ? setObjectiveBeacons : setRecipeBeacons;
    this.store.dispatch(action({ id, value }));
  }

  setOverclock(
    id: string,
    value: Rational,
    def: Rational | undefined,
    objective = false,
  ): void {
    const action = objective ? setObjectiveOverclock : setRecipeOverclock;
    this.store.dispatch(action({ id, value, def }));
  }

  setCheckedItems(checkedItemIds: Set<string>): void {
    this.store.dispatch(setCheckedItems({ checkedItemIds }));
  }

  setCheckedRecipes(checkedRecipeIds: Set<string>): void {
    this.store.dispatch(setCheckedRecipes({ checkedRecipeIds }));
  }

  setCheckedObjectives(checkedObjectiveIds: Set<string>): void {
    this.store.dispatch(setCheckedObjectives({ checkedObjectiveIds }));
  }

  resetItem(id: string): void {
    this.store.dispatch(resetItem({ id }));
  }

  resetRecipe(id: string): void {
    this.store.dispatch(resetRecipe({ id }));
  }

  resetRecipeObjective(id: string): void {
    this.store.dispatch(resetObjective({ id }));
  }

  resetChecked(): void {
    this.store.dispatch(resetChecked());
  }

  resetExcludedItems(): void {
    this.store.dispatch(resetExcludedItems());
  }

  resetBelts(): void {
    this.store.dispatch(resetBelts());
  }

  resetWagons(): void {
    this.store.dispatch(resetWagons());
  }

  resetMachines(): void {
    this.store.dispatch(resetMachines());
  }

  resetBeacons(): void {
    this.store.dispatch(resetBeacons());
  }
}
