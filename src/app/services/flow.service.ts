import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, switchMap } from 'rxjs';

import {
  ColumnsState,
  Dataset,
  FlowData,
  FlowStyle,
  LinkValue,
  MIN_LINK_VALUE,
  NodeType,
  Rational,
  Step,
  themeMap,
} from '~/models';
import { LabState, Objectives, Preferences, Recipes, Settings } from '~/store';

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  translateSvc = inject(TranslateService);
  store = inject(Store<LabState>);

  flowData$ = combineLatest([
    this.store.select(Objectives.getSteps),
    this.store.select(Recipes.getAdjustedDataset),
    this.store
      .select(Settings.getDisplayRateInfo)
      .pipe(switchMap((dr) => this.translateSvc.get(dr.suffix))),
    this.store.select(Preferences.getColumns),
    this.store.select(Preferences.getTheme),
  ]).pipe(
    map(([steps, data, suffix, columns, theme]) =>
      this.buildGraph(steps, data, suffix, columns, themeMap[theme]),
    ),
  );

  buildGraph(
    steps: Step[],
    data: Dataset,
    suffix: string,
    columnsState: ColumnsState,
    theme: FlowStyle,
  ): FlowData {
    const flow: FlowData = {
      theme,
      nodes: [],
      links: [],
    };

    const itemPrec = columnsState.items.precision;
    const machinePrec = columnsState.machines.precision;

    for (const step of steps) {
      if (step.recipeId && step.machines) {
        const recipe = data.recipeEntities[step.recipeId];
        const settings = step.recipeSettings;
        const recipeIcon = data.iconEntities[recipe.icon ?? recipe.id];

        if (settings?.machineId != null) {
          const machine = data.itemEntities[settings.machineId];
          // CREATE NODE: Standard recipe
          flow.nodes.push({
            id: `r|${step.id}`,
            type: step.recipeObjectiveId
              ? NodeType.Output
              : Object.keys(recipe.in).length === 0
              ? NodeType.Input
              : NodeType.Recipe,
            name: recipe.name,
            text: `${step.machines.toString(machinePrec)} ${machine.name}`,
            recipe,
            machineId: settings.machineId,
            machines: step.machines.toString(machinePrec),
            color: recipeIcon.color,
            stepId: step.id,
            viewBox: `${recipeIcon.position
              .replace(/px/g, '')
              .replace(/-/g, '')} 64 64`,
            href: recipeIcon.file,
          });
        }
      }

      if (step.itemId) {
        const item = data.itemEntities[step.itemId];
        const itemIcon = data.iconEntities[item.icon ?? item.id];
        if (step.surplus) {
          // CREATE NODE: Surplus
          flow.nodes.push({
            id: `s|${step.itemId}`,
            type: NodeType.Surplus,
            name: item.name,
            text: `${step.surplus.toString(itemPrec)}${suffix}`,
            color: itemIcon.color,
            stepId: step.id,
            viewBox: `${itemIcon.position
              .replace(/px/g, '')
              .replace(/-/g, '')} 64 64`,
            href: itemIcon.file,
          });
          // Links to surplus node
          for (const sourceStep of steps) {
            if (sourceStep.recipeId && sourceStep.outputs) {
              if (sourceStep.outputs[step.itemId]) {
                const sourceAmount = step.surplus.mul(
                  sourceStep.outputs[step.itemId],
                );
                // CREATE LINK: Recipe -> Surplus
                flow.links.push({
                  source: `r|${sourceStep.id}`,
                  target: `s|${step.itemId}`,
                  name: item.name,
                  text: `${sourceAmount.toString(itemPrec)}${suffix}`,
                  color: itemIcon.color,
                  value: sourceAmount.toNumber(),
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
              if (targetId === '') continue; // Skip output parent

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
                      sourceStep.outputs[step.itemId],
                    );
                    amount = amount.sub(sourceAmount);

                    // CREATE LINK: Recipe -> Recipe
                    flow.links.push({
                      source: `r|${sourceStep.id}`,
                      target: `r|${targetId}`,
                      name: item.name,
                      text: `${sourceAmount.toString(itemPrec)}${suffix}`,
                      color: itemIcon.color,
                      value: sourceAmount.toNumber(),
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
                  color: itemIcon.color,
                  value: amount.toNumber(),
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
                color: itemIcon.color,
                stepId: step.id,
                viewBox: `${itemIcon.position
                  .replace(/px/g, '')
                  .replace(/-/g, '')} 64 64`,
                href: itemIcon.file,
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
              color: itemIcon.color,
              stepId: step.id,
              viewBox: `${itemIcon.position
                .replace(/px/g, '')
                .replace(/-/g, '')} 64 64`,
              href: itemIcon.file,
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
                    color: itemIcon.color,
                    value: step.output
                      .mul(sourceStep.outputs[step.itemId])
                      .toNumber(),
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

  stepLinkValue(step: Step, prop: LinkValue): Rational {
    if (prop === LinkValue.None || prop === LinkValue.Percent)
      return Rational.one;

    switch (prop) {
      case LinkValue.Belts:
        return step.belts ?? Rational.zero;
      case LinkValue.Wagons:
        return step.wagons ?? Rational.zero;
      case LinkValue.Machines:
        return step.machines ?? Rational.zero;
      default:
        return step.items ?? Rational.zero;
    }
  }

  linkSize(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    stack: Rational | undefined,
  ): number {
    if (prop === LinkValue.None) return 1;

    if (prop === LinkValue.Percent) return percent.toNumber() || MIN_LINK_VALUE;

    // Scale link size for fluids to 1/10
    if (prop === LinkValue.Items && stack == null)
      value = value.div(Rational.ten);

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  linkText(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    precision: number | null,
  ): string {
    switch (prop) {
      case LinkValue.None:
        return '';
      case LinkValue.Percent:
        return `${Math.round(percent.mul(Rational.hundred).toNumber())}%`;
      default: {
        const result = value.mul(percent);
        if (precision == null) return result.toFraction();
        return result.toPrecision(precision).toString();
      }
    }
  }
}
