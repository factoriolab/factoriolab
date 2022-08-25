import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';

import {
  Column,
  Dataset,
  DisplayRateInfo,
  Entities,
  FlowData,
  FlowStyle,
  ItemSettings,
  Rational,
  RecipeSettings,
  Step,
  themeMap,
} from '~/models';
import {
  Items,
  LabState,
  Preferences,
  Products,
  Recipes,
  Settings,
} from '~/store';
import { ColumnsState } from '~/store/preferences';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  flowData$: Observable<FlowData>;

  constructor(private store: Store<LabState>, private theme: ThemeService) {
    this.flowData$ = combineLatest([
      this.store.select(Products.getSteps),
      this.store.select(Items.getItemSettings),
      this.store.select(Recipes.getRecipeSettings),
      this.store.select(Recipes.getAdjustedDataset),
      this.store.select(Settings.getDisplayRateInfo),
      this.store.select(Preferences.getColumns),
      this.theme.theme$,
    ]).pipe(
      map(
        ([
          steps,
          itemSettings,
          recipeSettings,
          data,
          dispRateInfo,
          columns,
          theme,
        ]) =>
          this.buildGraph(
            steps,
            itemSettings,
            recipeSettings,
            data,
            dispRateInfo,
            columns,
            themeMap[theme]
          )
      )
    );
  }

  buildGraph(
    steps: Step[],
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RecipeSettings>,
    data: Dataset,
    dispRateInfo: DisplayRateInfo,
    columns: ColumnsState,
    theme: FlowStyle
  ): FlowData {
    const flow: FlowData = {
      theme,
      nodes: [],
      links: [],
    };

    const itemPrec = columns[Column.Items].precision;
    const rateLbl = dispRateInfo.label;

    for (const step of steps) {
      if (step.recipeId && step.factories) {
        const recipe = data.recipeEntities[step.recipeId];
        const settings = recipeSettings[step.recipeId];

        if (settings.factoryId == null) break;
        const factory = data.itemEntities[settings.factoryId];
        const nodeTheme =
          Object.keys(recipe.in).length === 0
            ? theme.node.input
            : theme.node.recipe;
        // CREATE NODE: Standard recipe
        flow.nodes.push({
          id: `r|${step.recipeId}`,
          name: recipe.name,
          text: `${step.factories.toString(itemPrec)} ${factory.name}`,
          color: nodeTheme.color,
          background: nodeTheme.background,
          recipe,
          factoryId: settings.factoryId,
          factories: step.factories.toString(
            columns[Column.Factories].precision
          ),
        });
      }

      if (step.itemId) {
        const item = data.itemEntities[step.itemId];
        if (step.surplus) {
          // CREATE NODE: Surplus
          flow.nodes.push({
            id: `s|${step.itemId}`,
            name: item.name,
            text: `${step.surplus.toString(itemPrec)}${rateLbl}`,
            color: theme.node.surplus.color,
            background: theme.node.surplus.background,
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
                  source: `r|${sourceStep.recipeId}`,
                  target: `s|${step.itemId}`,
                  name: item.name,
                  text: `${sourceAmount.toString(itemPrec)}${rateLbl}`,
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
              // This is how much is requested by that recipe, but need recipe source
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
                      source: `r|${sourceStep.recipeId}`,
                      target: `r|${targetId}`,
                      name: item.name,
                      text: `${sourceAmount.toString(itemPrec)}${rateLbl}`,
                    });
                  }
                }
              }

              if (
                !itemSettings[step.itemId].ignore &&
                amount.gt(Rational.zero)
              ) {
                inputAmount = inputAmount.add(amount);
                // CREATE LINK: Input -> Recipe
                flow.links.push({
                  source: `i|${step.itemId}`,
                  target: `r|${targetId}`,
                  name: item.name,
                  text: `${targetAmount.toString(itemPrec)}${rateLbl}`,
                });
              }
            }

            if (
              !itemSettings[step.itemId].ignore &&
              inputAmount.gt(Rational.zero)
            ) {
              // CREATE NODE: Input
              flow.nodes.push({
                id: `i|${step.itemId}`,
                name: item.name,
                text: `${inputAmount.toString(itemPrec)}${rateLbl}`,
                color: theme.node.output.color,
                background: theme.node.input.background,
              });
            }
          }

          if (itemAmount.gt(step.surplus || Rational.zero)) {
            // CREATE NODE: Output
            flow.nodes.push({
              id: `o|${step.itemId}`,
              name: item.name,
              text: `${itemAmount
                .sub(step.surplus || Rational.zero)
                .toString(itemPrec)}${rateLbl}`,
              color: theme.node.output.color,
              background: theme.node.output.background,
            });
            for (const sourceStep of steps) {
              if (sourceStep.recipeId && sourceStep.outputs) {
                if (sourceStep.outputs[step.itemId]) {
                  // CREATE LINK: Recipe -> Output
                  flow.links.push({
                    source: `r|${sourceStep.recipeId}`,
                    target: `o|${step.itemId}`,
                    name: item.name,
                    text: `${itemAmount
                      .sub(step.surplus || Rational.zero)
                      .mul(sourceStep.outputs[step.itemId])
                      .toString(itemPrec)}${rateLbl}`,
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
