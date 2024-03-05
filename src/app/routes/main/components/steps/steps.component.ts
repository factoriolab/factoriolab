import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { MenuItem, SortEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  pairwise,
  tap,
} from 'rxjs';

import {
  ColumnsState,
  Dataset,
  EnergyType,
  Entities,
  Game,
  IdValueDefaultPayload,
  ItemId,
  ObjectiveBase,
  ObjectiveUnit,
  Rational,
  RecipeField,
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
import { RecipeUtility } from '~/utilities';

export type StepsMode = 'all' | 'focus';

@UntilDestroy()
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

  focus$ = new BehaviorSubject<boolean>(false);
  @Input() set focus(value: boolean) {
    this.focus$.next(value);
  }

  selectedId$ = new BehaviorSubject<string | null>(null);
  @Input() set selectedId(value: string | null) {
    this.selectedId$.next(value);
  }

  steps$ = combineLatest({
    focus: this.focus$,
    selectedId: this.selectedId$,
    steps: this.store.select(Objectives.getSteps),
  }).pipe(
    map(({ focus, selectedId, steps }) =>
      focus ? steps.filter((s) => s.id === selectedId) : steps,
    ),
  );
  vm$ = combineLatest({
    focus: this.focus$,
    machinesState: this.store.select(Machines.getMachinesState),
    itemsState: this.store.select(Items.getItemsState),
    itemsModified: this.store.select(Items.getItemsModified),
    stepsModified: this.store.select(Objectives.getStepsModified),
    totals: this.store.select(Objectives.getTotals),
    steps: this.steps$,
    stepDetails: this.store.select(Objectives.getStepDetails),
    stepById: this.store.select(Objectives.getStepById),
    stepByItemEntities: this.store.select(Objectives.getStepByItemEntities),
    stepTree: this.store.select(Objectives.getStepTree),
    effectivePowerUnit: this.store.select(Objectives.getEffectivePowerUnit),
    recipesState: this.store.select(Recipes.getRecipesState),
    recipesModified: this.store.select(Objectives.getRecipesModified),
    data: this.store.select(Recipes.getAdjustedDataset),
    columnsState: this.store.select(Settings.getColumnsState),
    settings: this.store.select(Settings.getSettings),
    dispRateInfo: this.store.select(Settings.getDisplayRateInfo),
    options: this.store.select(Settings.getOptions),
    beltSpeed: this.store.select(Settings.getBeltSpeed),
    beltSpeedTxt: this.store.select(Settings.getBeltSpeedTxt),
    preferences: this.store.select(Preferences.preferencesState),
    zipPartial: this.routerSvc.zipConfig$,
  }).pipe(
    tap((vm) => {
      vm.steps = [...vm.steps]; // Preserve original order
      this.setActiveItems(vm.steps, vm.stepDetails);
      if (vm.focus) {
        this.stepsTable?.toggleRow(vm.steps[0]);
      }
    }),
  );

  sortSteps$ = new BehaviorSubject<SortEvent | null>(null);

  @ViewChild('stepsTable') stepsTable: Table | undefined;

  activeItem: Entities<MenuItem> = {};
  fragmentId: string | null | undefined;
  stepDetailIcon = stepDetailIcon;

  ItemId = ItemId;
  StepDetailTab = StepDetailTab;
  Game = Game;
  RecipeField = RecipeField;
  EnergyType = EnergyType;
  ObjectiveUnit = ObjectiveUnit;
  Rational = Rational;

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

    combineLatest([
      this.sortSteps$.pipe(pairwise()),
      this.store.select(Objectives.getSteps),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([[prev, curr], steps]) => {
        this.sortSteps(prev, curr, steps);
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
                  this.stepsTable.toggleRow(step);
                  setTimeout(() => {
                    if (tabId) {
                      const tab = this.document.querySelector(
                        '#' + this.fragmentId,
                      ) as HTMLElement | null;
                      if (tab) {
                        tab.click();
                      }
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
      this.stepsTable.sortOrder = 0;
      this.stepsTable.sortField = '';
      this.stepsTable.reset();
      return this.sortSteps$.next(null);
    }

    // Sort by numeric field
    curr.data?.sort((a: Step, b: Step) => {
      const diff = (a[field] ?? Rational.zero).sub(b[field] ?? Rational.zero);
      return diff.toNumber() * order;
    });
  }

  setActiveItems(steps: Step[], stepDetails: Entities<StepDetail>): void {
    steps.forEach((s) => {
      const id = StepIdPipe.transform(s);
      const old = this.activeItem[id];
      const detail = stepDetails[s.id];
      if (detail == null) return;

      if (old == null) {
        this.activeItem[id] = detail.tabs[0];
      } else {
        const match = detail.tabs.find((t) => t.label === old.label);
        if (match == null) {
          this.activeItem[id] = detail.tabs[0];
        } else {
          this.activeItem[id] = match;
        }
      }
    });
  }

  setActiveItem(step: Step, item: MenuItem): void {
    const id = StepIdPipe.transform(step);
    this.activeItem[id] = item;
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

  export(
    steps: Step[],
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
    columnsState: ColumnsState,
    data: Dataset,
  ): void {
    this.exportSvc.stepsToCsv(
      steps,
      columnsState,
      itemsState,
      recipesState,
      data,
    );
  }

  toggleRecipes(ids: string[], value: boolean, data: Dataset): void {
    const payload = ids.map(
      (id): IdValueDefaultPayload<boolean> => ({
        id,
        value,
        def: (data.defaults?.excludedRecipeIds ?? []).includes(id),
      }),
    );
    this.setRecipeExcludedBatch(payload);
  }

  toggleRecipe(
    id: string,
    recipesState: Recipes.RecipesState,
    data: Dataset,
  ): void {
    const value = !recipesState[id].excluded;
    const def = (data.defaults?.excludedRecipeIds ?? []).some((i) => i === id);
    this.setRecipeExcluded(id, value, def);
  }

  changeRecipeField(
    step: Step,
    event: string | number,
    machinesState: Machines.MachinesState,
    data: Dataset,
    field: RecipeField,
    index?: number,
    subindex?: number,
  ): void {
    if (step.recipeId == null) return;

    const id = step.recipeObjectiveId ?? step.recipeId;
    const isObjective = step.recipeObjectiveId != null;
    const settings = step.recipeSettings;
    if (settings?.machineId) {
      const machineSettings = machinesState.entities[settings.machineId];
      switch (field) {
        case RecipeField.Machine: {
          if (typeof event === 'string' && machinesState.ids != null) {
            this.setMachine(
              step.recipeObjectiveId ?? step.recipeId,
              event,
              RecipeUtility.bestMatch(
                data.recipeEntities[step.recipeId].producers,
                machinesState.ids,
              ),
              step.recipeObjectiveId != null,
            );
          }

          break;
        }
        case RecipeField.Fuel: {
          if (typeof event === 'string') {
            this.setFuel(
              step.recipeObjectiveId ?? step.recipeId,
              event,
              machineSettings.fuelId,
              step.recipeObjectiveId != null,
            );
          }

          break;
        }
        case RecipeField.MachineModules: {
          if (
            machineSettings.moduleRankIds != null &&
            data != null &&
            typeof event === 'string' &&
            index != null &&
            settings.machineModuleIds != null
          ) {
            const machine = data.machineEntities[settings.machineId];
            const count = settings.machineModuleIds.length;
            const options = RecipeUtility.moduleOptions(
              machine,
              step.recipeId,
              data,
            );
            const def = RecipeUtility.defaultModules(
              options,
              machineSettings.moduleRankIds,
              count,
            );
            const modules = this.generateModules(
              index,
              event,
              settings.machineModuleIds,
            );
            this.setMachineModules(id, modules, def, isObjective);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string' && index != null) {
            const def = machineSettings.beaconCount;
            this.setBeaconCount(id, index, event, def, isObjective);
          }
          break;
        }
        case RecipeField.Beacon: {
          if (typeof event === 'string' && index != null) {
            const def = machineSettings.beaconId;
            this.setBeacon(id, index, event, def, isObjective);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            machineSettings.beaconModuleRankIds != null &&
            typeof event === 'string' &&
            index != null &&
            subindex != null
          ) {
            const beaconSettings = settings.beacons?.[index];
            if (
              beaconSettings?.id != null &&
              beaconSettings?.moduleIds != null
            ) {
              const beacon = data.beaconEntities[beaconSettings.id];
              const count = beaconSettings.moduleIds.length;
              const options = RecipeUtility.moduleOptions(
                beacon,
                step.recipeId,
                data,
              );
              const def = RecipeUtility.defaultModules(
                options,
                machineSettings.beaconModuleRankIds,
                count,
              );
              const value = this.generateModules(
                subindex,
                event,
                beaconSettings.moduleIds,
              );
              this.setBeaconModules(id, index, value, def, isObjective);
            }
          }
          break;
        }
        case RecipeField.BeaconTotal: {
          if (typeof event === 'string' && index != null) {
            this.setBeaconTotal(id, index, event, isObjective);
          }
          break;
        }
        case RecipeField.Overclock: {
          if (typeof event === 'number') {
            const def = machineSettings.overclock;
            const value = Math.max(1, Math.min(250, event));
            this.setOverclock(id, value, def, isObjective);
          }
          break;
        }
      }
    }
  }

  generateModules(index: number, value: string, original: string[]): string[] {
    const modules = [...original]; // Copy
    // Fill in index to the right
    for (let i = index; i < modules.length; i++) {
      modules[i] = value;
    }
    return modules;
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

  setMachineModules(
    id: string,
    value: string[],
    def: string[] | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetMachineModulesAction
      : Recipes.SetMachineModulesAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  addBeacon(id: string, objective = false): void {
    const action = objective
      ? Objectives.AddBeaconAction
      : Recipes.AddBeaconAction;
    this.store.dispatch(new action(id));
  }

  removeBeacon(id: string, value: number, objective = false): void {
    const action = objective
      ? Objectives.RemoveBeaconAction
      : Recipes.RemoveBeaconAction;
    this.store.dispatch(new action({ id, value }));
  }

  setBeaconCount(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetBeaconCountAction
      : Recipes.SetBeaconCountAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeacon(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetBeaconAction
      : Recipes.SetBeaconAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconModules(
    id: string,
    index: number,
    value: string[],
    def: string[] | undefined,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetBeaconModulesAction
      : Recipes.SetBeaconModulesAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconTotal(
    id: string,
    index: number,
    value: string,
    objective = false,
  ): void {
    const action = objective
      ? Objectives.SetBeaconTotalAction
      : Recipes.SetBeaconTotalAction;
    this.store.dispatch(new action({ id, index, value }));
  }

  setOverclock(
    id: string,
    value: number,
    def: number | undefined,
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
