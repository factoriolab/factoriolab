import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  Entities,
  WAGON_STACKS,
  WAGON_FLUID,
  Rational,
  DisplayRateVal,
  RationalProduct,
  Sort,
  SankeyData,
} from '~/models';
import { RateUtility, MatrixUtility, RecipeUtility } from '~/utilities';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { State } from '../';
import { ProductsState } from './products.reducer';

/* Base selector functions */
const productsState = (state: State) => state.productsState;
const sIds = (state: ProductsState) => state.ids;
const sEntities = (state: ProductsState) => state.entities;

/* Simple selectors */
export const getIds = compose(sIds, productsState);
export const getEntities = compose(sEntities, productsState);

/* Complex selectors */
export const getProducts = createSelector(
  getIds,
  getEntities,
  Settings.getNormalDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.itemEntities[p.itemId])
);

export const getRationalProducts = createSelector(getProducts, (products) =>
  products.map((p) => new RationalProduct(p))
);

export const getProductsBy = createSelector(getRationalProducts, (products) =>
  products.reduce((e: Entities<RationalProduct[]>, p) => {
    if (!e[p.rateType]) {
      e[p.rateType] = [];
    }
    e[p.rateType] = [...e[p.rateType], p];
    return e;
  }, {})
);

export const getNormalizedRatesByItems = createSelector(
  getProductsBy,
  Settings.getDisplayRate,
  (products, displayRate) => {
    return products[RateType.Items]?.reduce((e: Entities<Rational>, p) => {
      e[p.id] = p.rate.div(DisplayRateVal[displayRate]);
      return e;
    }, {});
  }
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsBy,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  (products, itemSettings, beltSpeed) => {
    return products[RateType.Belts]?.reduce((e: Entities<Rational>, p) => {
      e[p.id] = p.rate.mul(beltSpeed[itemSettings[p.itemId].belt]);
      return e;
    }, {});
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsBy,
  Settings.getDisplayRate,
  Settings.getDataset,
  (products, displayRate, data) => {
    return products[RateType.Wagons]?.reduce((e: Entities<Rational>, p) => {
      const item = data.itemR[p.itemId];
      e[p.id] = p.rate
        .div(DisplayRateVal[displayRate])
        .mul(item.stack ? item.stack.mul(WAGON_STACKS) : WAGON_FLUID);
      return e;
    }, {});
  }
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsBy,
  Recipes.getAdjustedDataset,
  (products, data) => {
    return products[RateType.Factories]?.reduce((e: Entities<Rational>, p) => {
      const recipe = data.recipeR[data.itemRecipeIds[p.itemId]];
      // Ensures matching recipe is found, else case should be blocked by UI
      if (recipe) {
        e[p.id] = p.rate
          .div(recipe.time)
          .mul(recipe.out[p.itemId])
          .div(recipe.adjustProd || Rational.one);
      }
      return e;
    }, {});
  }
);

export const getNormalizedRates = createSelector(
  getNormalizedRatesByItems,
  getNormalizedRatesByBelts,
  getNormalizedRatesByWagons,
  getNormalizedRatesByFactories,
  (byItems, byBelts, byWagons, byFactories) => {
    return { ...byItems, ...byBelts, ...byWagons, ...byFactories };
  }
);

export const getNormalizedSteps = createSelector(
  getProducts,
  getNormalizedRates,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Recipes.getAdjustedDataset,
  Settings.getFuel,
  (products, rates, itemSettings, recipeSettings, data, fuel) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        product.itemId,
        rates[product.id],
        steps,
        itemSettings,
        recipeSettings,
        fuel,
        data
      );
    }
    return steps;
  }
);

export const getNormalizedStepsWithMatrices = createSelector(
  getNormalizedSteps,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Recipes.getAdjustedDataset,
  Settings.getDisabledRecipes,
  Settings.getFuel,
  (steps, itemSettings, recipeSettings, data, disabledRecipes, fuel) =>
    MatrixUtility.solveMatricesFor(
      steps,
      itemSettings,
      recipeSettings,
      disabledRecipes,
      fuel,
      data
    )
);

export const getNormalizedStepsSorted = createSelector(
  getNormalizedStepsWithMatrices,
  Settings.getSort,
  (steps, sort) => {
    const newSteps = [...steps];
    if (sort === Sort.BreadthFirst) {
      return newSteps.sort((a, b) => a.depth - b.depth);
    }
    return newSteps;
  }
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsSorted,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  Recipes.getAdjustedDataset,
  (steps, itemSettings, beltSpeed, data) =>
    RateUtility.calculateBelts(steps, itemSettings, beltSpeed, data)
);

export const getSteps = createSelector(
  getNormalizedStepsWithBelts,
  Settings.getDisplayRate,
  (steps, displayRate) => RateUtility.displayRate(steps, displayRate)
);

export const getSankey = createSelector(
  getSteps,
  Settings.getLinkValue,
  Recipes.getAdjustedDataset,
  (steps, linkValue, data) => {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };

    for (const step of steps) {
      const value = RateUtility.stepLinkValue(step, linkValue);

      if (step.recipeId) {
        const recipe = RecipeUtility.nonCircularRecipe(
          data.recipeR[step.recipeId]
        );
        const icon = data.iconEntities[step.recipeId];

        sankey.nodes.push({
          id: step.recipeId,
          name: recipe.name,
          color: icon.color,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
        });

        if (step.itemId === step.recipeId) {
          if (step.parents) {
            for (const i of Object.keys(step.parents)) {
              sankey.links.push({
                target: i,
                source: step.recipeId,
                value: step.parents[i].mul(value).toNumber(),
              });
            }
          }
        } else {
          for (const outId of Object.keys(recipe.out)) {
            const outStep = steps.find((s) => s.itemId === outId);
            const outValue = RateUtility.stepLinkValue(outStep, linkValue);
            sankey.links.push({
              target: outId,
              source: step.recipeId,
              value: outValue.toNumber(),
            });
          }
        }
      }

      if (step.itemId && step.itemId !== step.recipeId) {
        const icon = data.iconEntities[step.itemId];

        sankey.nodes.push({
          id: step.itemId,
          name: data.itemR[step.itemId].name,
          color: icon.color,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
        });
        if (step.parents) {
          for (const i of Object.keys(step.parents)) {
            const recipe = RecipeUtility.nonCircularRecipe(data.recipeR[i]);
            if (recipe.in[step.itemId]) {
              sankey.links.push({
                target: i,
                source: step.itemId,
                value: step.parents[i].mul(value).toNumber(),
              });
            }
          }
        }
      }
    }

    return sankey;
  }
);

export const getZipState = createSelector(
  productsState,
  Items.itemsState,
  Recipes.recipesState,
  Settings.settingsState,
  (products, items, recipes, settings) => {
    return { products, items, recipes, settings };
  }
);
