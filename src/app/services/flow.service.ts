import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable, switchMap } from 'rxjs';

import {
  Column,
  Dataset,
  FlowData,
  FlowStyle,
  NodeType,
  Rational,
  Step,
  themeMap,
} from '~/models';
import {
  ItemObjectives,
  LabState,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { ColumnsState } from '~/store/preferences';

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  flowData$: Observable<FlowData>;

  constructor(
    private translateSvc: TranslateService,
    private store: Store<LabState>
  ) {
    this.flowData$ = combineLatest([
      this.store.select(ItemObjectives.getSteps),
      this.store.select(Recipes.getAdjustedDataset),
      this.store
        .select(Settings.getDisplayRateInfo)
        .pipe(switchMap((dr) => this.translateSvc.get(dr.suffix))),
      this.store.select(Preferences.getColumns),
      this.store.select(Preferences.getTheme),
    ]).pipe(
      map(([steps, data, suffix, columns, theme]) =>
        this.buildGraph(steps, data, suffix, columns, themeMap[theme])
      )
    );
  }

  buildGraph(
    steps: Step[],
    data: Dataset,
    suffix: string,
    columns: ColumnsState,
    theme: FlowStyle
  ): FlowData {
    const flow: FlowData = {
      theme,
      nodes: [],
      links: [],
    };

    const itemPrec = columns[Column.Items].precision;
    const machinePrec = columns[Column.Machines].precision;

    for (const step of steps) {
      if (step.recipeId && step.machines) {
        const recipe = data.recipeEntities[step.recipeId];
        const settings = step.recipeSettings;

        if (settings?.machineId != null) {
          const machine = data.itemEntities[settings.machineId];
          // CREATE NODE: Standard recipe
          flow.nodes.push({
            id: `r|${step.id}`,
            type: step.producerId
              ? NodeType.Output
              : Object.keys(recipe.in).length === 0
              ? NodeType.Input
              : NodeType.Recipe,
            name: recipe.name,
            text: `${step.machines.toString(machinePrec)} ${machine.name}`,
            recipe,
            machineId: settings.machineId,
            machines: step.machines.toString(machinePrec),
          });
        }
      }

      if (step.itemId) {
        const item = data.itemEntities[step.itemId];
        if (step.surplus) {
          // CREATE NODE: Surplus
          flow.nodes.push({
            id: `s|${step.itemId}`,
            type: NodeType.Surplus,
            name: item.name,
            text: `${step.surplus.toString(itemPrec)}${suffix}`,
          });
          // Links to surplus node
          for (const sourceStep of steps) {
            if (sourceStep.recipeId && sourceStep.outputs) {
              if (sourceStep.outputs[step.itemId]) {
                const sourceAmount = step.surplus.mul(
                  sourceStep.outputs[step.itemId]
                );
                // CREATE LINK: Recipe -> Surplus
                flow.links.push({
                  source: `r|${sourceStep.id}`,
                  target: `s|${step.itemId}`,
                  name: item.name,
                  text: `${sourceAmount.toString(itemPrec)}${suffix}`,
                });
              }
            }
          }
        }

        if (step.items) {
          let itemAmount = step.items;
          if (step.parents) {
            let inputAmount = Rational.zero;

            // Links to recipe node
            for (const targetId of Object.keys(step.parents)) {
              // This is how much is requested by that step,
              // but need recipe source
              const targetAmount = step.items.mul(step.parents[targetId]);
              // Keep track of remaining amounts
              let amount = targetAmount;
              itemAmount = itemAmount.sub(amount);
              for (const sourceStep of steps) {
                if (sourceStep.recipeId && sourceStep.outputs) {
                  if (sourceStep.outputs[step.itemId]) {
                    // This source step produces this item
                    const sourceAmount = targetAmount.mul(
                      sourceStep.outputs[step.itemId]
                    );
                    amount = amount.sub(sourceAmount);

                    // CREATE LINK: Recipe -> Recipe
                    flow.links.push({
                      source: `r|${sourceStep.id}`,
                      target: `r|${targetId}`,
                      name: item.name,
                      text: `${sourceAmount.toString(itemPrec)}${suffix}`,
                    });
                  }
                }
              }

              if (amount.gt(Rational.zero)) {
                inputAmount = inputAmount.add(amount);
                // CREATE LINK: Input -> Recipe
                flow.links.push({
                  source: `i|${step.itemId}`,
                  target: `r|${targetId}`,
                  name: item.name,
                  text: `${amount.toString(itemPrec)}${suffix}`,
                });
              }
            }

            if (inputAmount.gt(Rational.zero)) {
              // CREATE NODE: Input
              flow.nodes.push({
                id: `i|${step.itemId}`,
                type: NodeType.Input,
                name: item.name,
                text: `${inputAmount.toString(itemPrec)}${suffix}`,
              });
            }
          }

          if (step.output) {
            // CREATE NODE: Output
            flow.nodes.push({
              id: `o|${step.itemId}`,
              type: NodeType.Output,
              name: item.name,
              text: `${step.output.toString(itemPrec)}${suffix}`,
            });
            for (const sourceStep of steps) {
              if (sourceStep.recipeId && sourceStep.outputs) {
                if (sourceStep.outputs[step.itemId]) {
                  // CREATE LINK: Recipe -> Output
                  flow.links.push({
                    source: `r|${sourceStep.id}`,
                    target: `o|${step.itemId}`,
                    name: item.name,
                    text: `${step.output
                      .mul(sourceStep.outputs[step.itemId])
                      .toString(itemPrec)}${suffix}`,
                  });
                }
              }
            }
          }
        }
      }
    }

    return flow;
  }
}
