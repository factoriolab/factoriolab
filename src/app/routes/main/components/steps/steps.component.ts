import { DOCUMENT } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { MenuItem, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject, combineLatest, filter, first, pairwise } from 'rxjs';

import { coalesce } from '~/helpers';
import {
  AdjustedDataset,
  BeaconSettings,
  EnergyType,
  Entities,
  Game,
  IdValueDefaultPayload,
  ItemId,
  ModuleSettings,
  ObjectiveBase,
  ObjectiveUnit,
  rational,
  Rational,
  Step,
  StepDetail,
  stepDetailIcon,
  StepDetailTab,
} from '~/models';
import { StepIdPipe } from '~/routes/main/pipes/step-id.pipe';
import {
  ContentService,
  ExportService,
  RouterService,
  TrackService,
} from '~/services';
import {
  Items,
  LabState,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';

export type StepsMode = 'all' | 'focus';

@Component({
  selector: 'lab-steps',
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
  store = inject(Store<LabState>);
  exportSvc = inject(ExportService);
  routerSvc = inject(RouterService);

  focus = input(false);
  selectedId = input<string | null>();
  steps = computed(() => {
    const steps = [...this.store.selectSignal(Objectives.getSteps)()];
    const focus = this.focus();
    if (!focus) return steps;
    const selectedId = this.selectedId();
    return steps.filter((s) => s.id === selectedId);
  });
  activeItemsEffect = effect(() => {
    const steps = this.steps();
    const stepDetails = this.store.selectSignal(Objectives.getStepDetails)();
    this.setActiveItems(steps, stepDetails);
  });
  toggleEffect = effect(() => {
    const focus = this.focus();
    const steps = this.steps();
    if (focus) this.stepsTable().toggleRow(steps[0]);
  });

  machinesState = this.store.selectSignal(Machines.getMachinesState);
  itemsState = this.store.selectSignal(Items.getItemsState);
  itemsModified = this.store.selectSignal(Items.getItemsModified);
  stepsModified = this.store.selectSignal(Objectives.getStepsModified);
  totals = this.store.selectSignal(Objectives.getTotals);
  stepDetails = this.store.selectSignal(Objectives.getStepDetails);
  stepById = this.store.selectSignal(Objectives.getStepById);
  stepByItemEntities = this.store.selectSignal(
    Objectives.getStepByItemEntities,
  );
  stepTree = this.store.selectSignal(Objectives.getStepTree);
  effectivePowerUnit = this.store.selectSignal(
    Objectives.getEffectivePowerUnit,
  );
  recipesState = this.store.selectSignal(Recipes.getRecipesState);
  recipesModified = this.store.selectSignal(Objectives.getRecipesModified);
  data = this.store.selectSignal(Recipes.getAdjustedDataset);
  columnsState = this.store.selectSignal(Settings.getColumnsState);
  settings = this.store.selectSignal(Settings.getSettings);
  dispRateInfo = this.store.selectSignal(Settings.getDisplayRateInfo);
  options = this.store.selectSignal(Settings.getOptions);
  beltSpeed = this.store.selectSignal(Settings.getBeltSpeed);
  preferences = this.store.selectSignal(Preferences.preferencesState);

  sortSteps$ = new BehaviorSubject<SortEvent | null>(null);

  stepsTable = viewChild.required<Table>('stepsTable');

  activeItem: Entities<MenuItem> = {};
  fragmentId: string | null | undefined;
  stepDetailIcon = stepDetailIcon;

  ItemId = ItemId;
  StepDetailTab = StepDetailTab;
  Game = Game;
  EnergyType = EnergyType;
  ObjectiveUnit = ObjectiveUnit;
  rational = rational;

  constructor() {
    combineLatest([
      this.sortSteps$.pipe(pairwise()),
      this.store.select(Objectives.getSteps),
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
        combineLatest([
          this.store.select(Objectives.getSteps),
          this.store.select(Objectives.getStepDetails),
        ])
          .pipe(first())
          .subscribe(([steps, stepDetails]) => {
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
      const diff = (a[field] ?? rational(0n)).sub(b[field] ?? rational(0n));
      return diff.toNumber() * order;
    });
  }

  setActiveItems(steps: Step[], stepDetails: Entities<StepDetail>): void {
    steps.forEach((step) => this.updateActiveItem(step, stepDetails, false));
  }

  expandRow(step: Step, expanded: boolean): void {
    if (expanded) return;
    this.updateActiveItem(step, this.stepDetails(), true);
  }

  private updateActiveItem(
    step: Step,
    stepDetails: Entities<StepDetail>,
    force: boolean,
  ): void {
    const id = StepIdPipe.transform(step);
    const item = this.getActiveItem(step, id, stepDetails, force);
    if (item) {
      const id = StepIdPipe.transform(step);
      this.activeItem[id] = item;
    }
  }

  /**
   * Get the active expansion tab for a step
   * @param force If false, only return a match for the existing expanded tab
   */
  private getActiveItem(
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

    if (!force) return null;

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

  toggleRecipes(ids: string[], value: boolean, data: AdjustedDataset): void {
    const payload = ids.map(
      (id): IdValueDefaultPayload<boolean> => ({
        id,
        value,
        def: coalesce(data.defaults?.excludedRecipeIds, []).includes(id),
      }),
    );
    this.setRecipeExcludedBatch(payload);
  }

  toggleRecipe(
    id: string,
    recipesState: Recipes.RecipesState,
    data: AdjustedDataset,
  ): void {
    const value = !recipesState[id].excluded;
    const def = coalesce(data.defaults?.excludedRecipeIds, []).some(
      (i) => i === id,
    );
    this.setRecipeExcluded(id, value, def);
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
    const machineSettings = machinesState.entities[settings.machineId];
    switch (field) {
      case 'machine': {
        if (typeof event !== 'string') return;
        const data = this.data();
        this.setMachine(
          id,
          event,
          RecipeUtility.bestMatch(
            data.recipeEntities[step.recipeId].producers,
            machinesState.ids,
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
            machinesState.moduleRankIds,
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

  changeStepChecked(step: Step, checked: boolean): void {
    // Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
    if (step.itemId != null) {
      this.setItemChecked(step.itemId, checked);
    } else if (step.recipeObjectiveId != null) {
      this.setRecipeChecked(step.recipeObjectiveId, checked, true);
    } else if (step.recipeId != null) {
      this.setRecipeChecked(step.recipeId, checked);
    }
  }

  /** Action Dispatch Methods */
  setRows(value: number): void {
    this.store.dispatch(new Preferences.SetRowsAction(value));
  }

  setItemExcluded(id: string, value: boolean): void {
    this.store.dispatch(new Items.SetExcludedAction({ id, value }));
  }

  setItemChecked(id: string, value: boolean): void {
    this.store.dispatch(new Items.SetCheckedAction({ id, value }));
  }

  setBelt(id: string, value: string, def: string): void {
    this.store.dispatch(new Items.SetBeltAction({ id, value, def }));
  }

  setWagon(id: string, value: string, def: string): void {
    this.store.dispatch(new Items.SetWagonAction({ id, value, def }));
  }

  setRecipeExcluded(id: string, value: boolean, def: boolean): void {
    this.store.dispatch(new Recipes.SetExcludedAction({ id, value, def }));
  }

  setRecipeExcludedBatch(payload: IdValueDefaultPayload<boolean>[]): void {
    this.store.dispatch(new Recipes.SetExcludedBatchAction(payload));
  }

  addObjective(value: ObjectiveBase): void {
    this.store.dispatch(new Objectives.AddAction(value));
  }

  setMachine(id: string, value: string, def: string, objective = false): void {
    const action = objective
      ? Objectives.SetMachineAction
      : Recipes.SetMachineAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setFuel(
    id: string,
    value: string,
    def: string | undefined,
    objective = false,
  ): void {
    const action = objective ? Objectives.SetFuelAction : Recipes.SetFuelAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setModules(
    id: string,
    value: ModuleSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetModulesAction
      : Recipes.SetModulesAction;
    this.store.dispatch(new action({ id, value }));
  }

  setBeacons(
    id: string,
    value: BeaconSettings[] | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetBeaconsAction
      : Recipes.SetBeaconsAction;
    this.store.dispatch(new action({ id, value }));
  }

  setOverclock(
    id: string,
    value: Rational,
    def: Rational | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetOverclockAction
      : Recipes.SetOverclockAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setRecipeChecked(id: string, value: boolean, objective = false): void {
    const action = objective
      ? Objectives.SetCheckedAction
      : Recipes.SetCheckedAction;
    this.store.dispatch(new action({ id, value }));
  }

  resetItem(value: string): void {
    this.store.dispatch(new Items.ResetItemAction(value));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }

  resetRecipeObjective(value: string): void {
    this.store.dispatch(new Objectives.ResetObjectiveAction(value));
  }

  resetChecked(): void {
    this.store.dispatch(new Items.ResetCheckedAction());
  }

  resetExcluded(): void {
    this.store.dispatch(new Items.ResetExcludedAction());
  }

  resetBelts(): void {
    this.store.dispatch(new Items.ResetBeltsAction());
  }

  resetWagons(): void {
    this.store.dispatch(new Items.ResetWagonsAction());
  }

  resetMachines(): void {
    this.store.dispatch(new Recipes.ResetMachinesAction());
  }

  resetBeacons(): void {
    this.store.dispatch(new Recipes.ResetBeaconsAction());
  }
}
