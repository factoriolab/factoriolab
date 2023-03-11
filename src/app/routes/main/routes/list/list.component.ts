import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Table } from 'primeng/table';
import { combineLatest, filter, first, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import {
  ColumnsCfg,
  Dataset,
  Game,
  ItemId,
  Rational,
  RecipeField,
  Step,
  StepDetailTab,
} from '~/models';
import {
  ContentService,
  ExportService,
  RouterService,
  TrackService,
} from '~/services';
import {
  ItemsCfg,
  ItemsObj,
  LabState,
  MachinesCfg,
  RecipesCfg,
  RecipesObj,
  Settings,
} from '~/store';
import { RecipeUtility } from '~/utilities';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, AfterViewInit {
  vm$ = combineLatest([
    this.store.select(MachinesCfg.getMachinesCfg),
    this.store.select(ItemsCfg.getItemsCfg),
    this.store.select(ItemsCfg.getItemsModified),
    this.store.select(ItemsObj.getStepsModified),
    this.store.select(ItemsObj.getTotals),
    this.store.select(ItemsObj.getSteps),
    this.store.select(ItemsObj.getStepDetails),
    this.store.select(ItemsObj.getStepById),
    this.store.select(ItemsObj.getStepByItemEntities),
    this.store.select(ItemsObj.getStepTree),
    this.store.select(ItemsObj.getEffectivePowerUnit),
    this.store.select(RecipesCfg.getRecipesCfg),
    this.store.select(RecipesCfg.getRecipesModified),
    this.store.select(RecipesCfg.getAdjustedDataset),
    this.store.select(Settings.getColumnsCfg),
    this.store.select(Settings.getSettings),
    this.store.select(Settings.getDisplayRateInfo),
    this.store.select(Settings.getOptions),
    this.store.select(Settings.getBeltSpeed),
    this.store.select(Settings.getBeltSpeedTxt),
    this.routerSvc.zipConfig$,
  ]).pipe(
    map(
      ([
        machinesCfg,
        itemsCfg,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepById,
        stepByItemEntities,
        stepTree,
        effectivePowerUnit,
        recipesCfg,
        recipesModified,
        data,
        columnsCfg,
        settings,
        dispRateInfo,
        options,
        beltSpeed,
        beltSpeedTxt,
        zipPartial,
      ]) => ({
        machinesCfg,
        itemsCfg,
        itemsModified,
        stepsModified,
        totals,
        steps,
        stepDetails,
        stepById,
        stepByItemEntities,
        stepTree,
        effectivePowerUnit,
        recipesCfg,
        recipesModified,
        data,
        columnsCfg,
        settings,
        dispRateInfo,
        options,
        beltSpeed,
        beltSpeedTxt,
        zipPartial,
      })
    )
  );

  @ViewChild('stepsTable') stepsTable: Table | undefined;

  fragmentId: string | null | undefined;

  ItemId = ItemId;
  StepDetailTab = StepDetailTab;
  Game = Game;
  RecipeField = RecipeField;
  Rational = Rational;

  constructor(
    public contentSvc: ContentService,
    public trackSvc: TrackService,
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private store: Store<LabState>,
    private exportSvc: ExportService,
    private routerSvc: RouterService
  ) {}

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        first(),
        filter((f) => f != null)
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
          this.store.select(ItemsObj.getSteps),
          this.store.select(ItemsObj.getStepDetails),
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
                        '#' + this.fragmentId + '_tab'
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

  resetStep(step: Step): void {
    if (step.itemId) {
      this.resetItem(step.itemId);
    }

    if (step.recipeObjectiveId) {
      this.resetRecipeObj(step.recipeObjectiveId);
    } else if (step.recipeId) {
      this.resetRecipe(step.recipeId);
    }
  }

  export(
    steps: Step[],
    itemsCfg: ItemsCfg.ItemsCfgState,
    recipesCfg: RecipesCfg.RecipesCfgState,
    columnsCfg: ColumnsCfg,
    data: Dataset
  ): void {
    this.exportSvc.stepsToCsv(steps, columnsCfg, itemsCfg, recipesCfg, data);
  }

  toggleRecipe(
    id: string,
    recipesCfg: RecipesCfg.RecipesCfgState,
    data: Dataset
  ): void {
    const value = !recipesCfg[id].excluded ?? true;
    const def = (data.defaults?.excludedRecipeIds ?? []).some((i) => i === id);
    this.setRecipeExcluded(id, value, def);
  }

  changeRecipeField(
    step: Step,
    event: string | number,
    machinesCfg: MachinesCfg.MachinesCfgState,
    data: Dataset,
    field: RecipeField,
    index?: number,
    subindex?: number
  ): void {
    if (step.recipeId == null) return;

    const id = step.recipeObjectiveId ?? step.recipeId;
    const isObjective = step.recipeObjectiveId != null;
    const settings = step.recipeSettings;
    if (settings?.machineId) {
      const machineCfg = machinesCfg.entities[settings.machineId];
      switch (field) {
        case RecipeField.Machine: {
          if (typeof event === 'string' && machinesCfg.ids != null) {
            this.setMachine(
              step.recipeObjectiveId ?? step.recipeId,
              event,
              RecipeUtility.bestMatch(
                data.recipeEntities[step.recipeId].producers,
                machinesCfg.ids
              ),
              step.recipeObjectiveId != null
            );
          }

          break;
        }
        case RecipeField.MachineModules: {
          if (
            machineCfg.moduleRankIds != null &&
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
              data
            );
            const def = RecipeUtility.defaultModules(
              options,
              machineCfg.moduleRankIds,
              count
            );
            const modules = this.generateModules(
              index,
              event,
              settings.machineModuleIds
            );
            this.setMachineModules(id, modules, def, isObjective);
          }
          break;
        }
        case RecipeField.BeaconCount: {
          if (typeof event === 'string' && index != null) {
            const def = machineCfg.beaconCount;
            this.setBeaconCount(id, index, event, def, isObjective);
          }
          break;
        }
        case RecipeField.Beacon: {
          if (typeof event === 'string' && index != null) {
            const def = machineCfg.beaconId;
            this.setBeacon(id, index, event, def, isObjective);
          }
          break;
        }
        case RecipeField.BeaconModules: {
          if (
            machineCfg.beaconModuleRankIds != null &&
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
                data
              );
              const def = RecipeUtility.defaultModules(
                options,
                machineCfg.beaconModuleRankIds,
                count
              );
              const value = this.generateModules(
                subindex,
                event,
                beaconSettings.moduleIds
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
            const def = machineCfg.overclock;
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
  setItemExcluded(id: string, value: boolean): void {
    this.store.dispatch(new ItemsCfg.SetExcludedAction({ id, value }));
  }

  setItemChecked(id: string, value: boolean): void {
    this.store.dispatch(new ItemsCfg.SetCheckedAction({ id, value }));
  }

  setBelt(id: string, value: string, def: string): void {
    this.store.dispatch(new ItemsCfg.SetBeltAction({ id, value, def }));
  }

  setWagon(id: string, value: string, def: string): void {
    this.store.dispatch(new ItemsCfg.SetWagonAction({ id, value, def }));
  }

  setRecipeExcluded(id: string, value: boolean, def: boolean): void {
    this.store.dispatch(new RecipesCfg.SetExcludedAction({ id, value, def }));
  }

  setMachine(id: string, value: string, def: string, objective = false): void {
    const action = objective
      ? RecipesObj.SetMachineAction
      : RecipesCfg.SetMachineAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setMachineModules(
    id: string,
    value: string[],
    def: string[] | undefined,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetMachineModulesAction
      : RecipesCfg.SetMachineModulesAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  addBeacon(id: string, objective = false): void {
    const action = objective
      ? RecipesObj.AddBeaconAction
      : RecipesCfg.AddBeaconAction;
    this.store.dispatch(new action(id));
  }

  removeBeacon(id: string, value: number, objective = false): void {
    const action = objective
      ? RecipesObj.RemoveBeaconAction
      : RecipesCfg.RemoveBeaconAction;
    this.store.dispatch(new action({ id, value }));
  }

  setBeaconCount(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetBeaconCountAction
      : RecipesCfg.SetBeaconCountAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeacon(
    id: string,
    index: number,
    value: string,
    def: string | undefined,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetBeaconAction
      : RecipesCfg.SetBeaconAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconModules(
    id: string,
    index: number,
    value: string[],
    def: string[] | undefined,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetBeaconModulesAction
      : RecipesCfg.SetBeaconModulesAction;
    this.store.dispatch(new action({ id, index, value, def }));
  }

  setBeaconTotal(
    id: string,
    index: number,
    value: string,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetBeaconTotalAction
      : RecipesCfg.SetBeaconTotalAction;
    this.store.dispatch(new action({ id, index, value }));
  }

  setOverclock(
    id: string,
    value: number,
    def: number | undefined,
    objective = false
  ): void {
    const action = objective
      ? RecipesObj.SetOverclockAction
      : RecipesCfg.SetOverclockAction;
    this.store.dispatch(new action({ id, value, def }));
  }

  setRecipeChecked(id: string, value: boolean, objective = false): void {
    const action = objective
      ? RecipesObj.SetCheckedAction
      : RecipesCfg.SetCheckedAction;
    this.store.dispatch(new action({ id, value }));
  }

  resetItem(value: string): void {
    this.store.dispatch(new ItemsCfg.ResetItemAction(value));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new RecipesCfg.ResetRecipeAction(value));
  }

  resetRecipeObj(value: string): void {
    this.store.dispatch(new RecipesObj.ResetObjectiveAction(value));
  }

  resetChecked(): void {
    this.store.dispatch(new ItemsCfg.ResetCheckedAction());
  }

  resetExcluded(): void {
    this.store.dispatch(new ItemsCfg.ResetExcludedAction());
  }

  resetBelts(): void {
    this.store.dispatch(new ItemsCfg.ResetBeltsAction());
  }

  resetWagons(): void {
    this.store.dispatch(new ItemsCfg.ResetWagonsAction());
  }

  resetMachines(): void {
    this.store.dispatch(new RecipesCfg.ResetMachinesAction());
  }

  resetBeacons(): void {
    this.store.dispatch(new RecipesCfg.ResetBeaconsAction());
  }
}
