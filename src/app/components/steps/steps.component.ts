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

import { DropdownBaseDirective, NoDragDirective } from '~/directives';
import { coalesce, updateSetIds } from '~/helpers';
import {
  BeaconSettings,
  Entities,
  Game,
  ItemId,
  ModuleSettings,
  ObjectiveBase,
  ObjectiveUnit,
  Rational,
  rational,
  Step,
  StepDetail,
  stepDetailIcon,
  StepDetailTab,
} from '~/models';
import {
  AsStepPipe,
  IconClassPipe,
  IconSmClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  MachineRatePipe,
  MachineShowPipe,
  MachineShowRatePipe,
  OptionsPipe,
  PowerPipe,
  RatePipe,
  StepHrefPipe,
  StepIdPipe,
  TranslatePipe,
} from '~/pipes';
import {
  ContentService,
  ExportService,
  RouterService,
  TrackService,
} from '~/services';
import {
  Items,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';

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
    const steps = [...this.store.selectSignal(Objectives.selectSteps)()];
    const focus = this.focus();
    if (!focus) return steps;
    const selectedId = this.selectedId();
    return steps.filter((s) => s.id === selectedId);
  });
  activeItemsEffect = effect(() => {
    const steps = this.steps();
    const stepDetails = this.store.selectSignal(Objectives.selectStepDetails)();
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

  machinesState = this.store.selectSignal(Machines.selectMachinesState);
  itemsState = this.store.selectSignal(Items.selectItemsState);
  itemsModified = this.store.selectSignal(Items.selectItemsModified);
  stepsModified = this.store.selectSignal(Objectives.selectStepsModified);
  totals = this.store.selectSignal(Objectives.selectTotals);
  stepDetails = this.store.selectSignal(Objectives.selectStepDetails);
  stepById = this.store.selectSignal(Objectives.selectStepById);
  stepByItemEntities = this.store.selectSignal(
    Objectives.selectStepByItemEntities,
  );
  stepTree = this.store.selectSignal(Objectives.selectStepTree);
  effectivePowerUnit = this.store.selectSignal(
    Objectives.selectEffectivePowerUnit,
  );
  recipesState = this.store.selectSignal(Recipes.selectRecipesState);
  recipesModified = this.store.selectSignal(Objectives.selectRecipesModified);
  data = this.store.selectSignal(Recipes.selectAdjustedDataset);
  columnsState = this.store.selectSignal(Settings.selectColumnsState);
  settings = this.store.selectSignal(Settings.selectSettings);
  dispRateInfo = this.store.selectSignal(Settings.selectDisplayRateInfo);
  options = this.store.selectSignal(Settings.selectOptions);
  beltSpeed = this.store.selectSignal(Settings.selectBeltSpeed);
  preferences = this.store.selectSignal(Preferences.preferencesState);

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
      this.store.select(Objectives.selectSteps),
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
        const [_, stepId, tabId] = this.fragmentId.split('_');
        combineLatest({
          steps: this.store.select(Objectives.selectSteps),
          stepDetails: this.store.select(Objectives.selectStepDetails),
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
                      const tab = this.document.querySelector(
                        '#' + this.fragmentId,
                      ) as HTMLElement | null;
                      if (tab) tab.click();
                    } else {
                      this.document
                        .querySelector('#' + this.fragmentId)
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
    if (curr == null || curr.order == null || curr.field == null) return;
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
      return this.sortSteps$.next(null);
    }

    // Sort by numeric field
    curr.data?.sort((a: Step, b: Step) => {
      const diff = (a[field] ?? rational.zero).sub(b[field] ?? rational.zero);
      return diff.toNumber() * order;
    });
  }

  setActiveItems(steps: Step[], stepDetails: Entities<StepDetail>): void {
    steps.forEach((step) => this._updateActiveItem(step, stepDetails, false));
  }

  expandRow(step: Step, expanded: boolean): void {
    if (expanded) return;
    this._updateActiveItem(step, this.stepDetails(), true);
  }

  private _updateActiveItem(
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
    this.store.dispatch(Preferences.setRows({ rows }));
  }

  setExcludedItems(excludedItemIds: Set<string>): void {
    this.store.dispatch(Settings.setExcludedItems({ excludedItemIds }));
  }

  setBelt(id: string, value: string, def: string): void {
    this.store.dispatch(Items.setBelt({ id, value, def }));
  }

  setWagon(id: string, value: string, def: string): void {
    this.store.dispatch(Items.setWagon({ id, value, def }));
  }

  setExcludedRecipes(value: Set<string>, def: Set<string>): void {
    this.store.dispatch(Settings.setExcludedRecipes({ value, def }));
  }

  addObjective(objective: ObjectiveBase): void {
    this.store.dispatch(Objectives.add({ objective }));
  }

  setMachine(id: string, value: string, def: string, objective = false): void {
    const action = objective ? Objectives.setMachine : Recipes.setMachine;
    this.store.dispatch(action({ id, value, def }));
  }

  setFuel(
    id: string,
    value: string,
    def: string | undefined,
    objective = false,
  ): void {
    const action = objective ? Objectives.setFuel : Recipes.setFuel;
    this.store.dispatch(action({ id, value, def }));
  }

  setModules(
    id: string,
    value: ModuleSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective ? Objectives.setModules : Recipes.setModules;
    this.store.dispatch(action({ id, value }));
  }

  setBeacons(
    id: string,
    value: BeaconSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective ? Objectives.setBeacons : Recipes.setBeacons;
    this.store.dispatch(action({ id, value }));
  }

  setOverclock(
    id: string,
    value: Rational,
    def: Rational | undefined,
    objective = false,
  ): void {
    const action = objective ? Objectives.setOverclock : Recipes.setOverclock;
    this.store.dispatch(action({ id, value, def }));
  }

  setCheckedItems(checkedItemIds: Set<string>): void {
    this.store.dispatch(Settings.setCheckedItems({ checkedItemIds }));
  }

  setCheckedRecipes(checkedRecipeIds: Set<string>): void {
    this.store.dispatch(Settings.setCheckedRecipes({ checkedRecipeIds }));
  }

  setCheckedObjectives(checkedObjectiveIds: Set<string>): void {
    this.store.dispatch(Settings.setCheckedObjectives({ checkedObjectiveIds }));
  }

  resetItem(id: string): void {
    this.store.dispatch(Items.resetItem({ id }));
  }

  resetRecipe(id: string): void {
    this.store.dispatch(Recipes.resetRecipe({ id }));
  }

  resetRecipeObjective(id: string): void {
    this.store.dispatch(Objectives.resetObjective({ id }));
  }

  resetChecked(): void {
    this.store.dispatch(Settings.resetChecked());
  }

  resetExcludedItems(): void {
    this.store.dispatch(Settings.resetExcludedItems());
  }

  resetBelts(): void {
    this.store.dispatch(Items.resetBelts());
  }

  resetWagons(): void {
    this.store.dispatch(Items.resetWagons());
  }

  resetMachines(): void {
    this.store.dispatch(Recipes.resetMachines());
  }

  resetBeacons(): void {
    this.store.dispatch(Recipes.resetBeacons());
  }
}
