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
} from '~/models';
import { RateUtility, MatrixUtility } from '~/utilities';
import * as Dataset from '../dataset';
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
  (ids, entities) => ids.map((i) => entities[i])
);

export const getRationalProducts = createSelector(getProducts, (products) =>
  products.map((p) => new RationalProduct(p))
);

export const getProductsBy = createSelector(getRationalProducts, (products) =>
  products.reduce((e: Entities<RationalProduct[]>, p) => {
    if (!e[p.rateType]) {
      e[p.rateType] = [];
    }
    return { ...e, ...{ [p.rateType]: [...e[p.rateType], p] } };
  }, {})
);

export const getNormalizedRatesByItems = createSelector(
  getProductsBy,
  Settings.getDisplayRate,
  (products, displayRate) => {
    return products[RateType.Items]?.reduce((e: Entities<Rational>, p) => {
      return {
        ...e,
        ...{
          [p.id]: p.rate.div(DisplayRateVal[displayRate]),
        },
      };
    }, {});
  }
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsBy,
  Items.getItemSettings,
  Dataset.getBeltSpeed,
  (products, itemSettings, beltSpeed) => {
    return products[RateType.Belts]?.reduce(
      (e: Entities<Rational>, p) => ({
        ...e,
        ...{
          [p.id]: p.rate.mul(beltSpeed[itemSettings[p.itemId].belt]),
        },
      }),
      {}
    );
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsBy,
  Settings.getDisplayRate,
  Dataset.getRationalDataset,
  (products, displayRate, data) => {
    return products[RateType.Wagons]?.reduce((e: Entities<Rational>, p) => {
      const item = data.itemR[p.itemId];
      return {
        ...e,
        ...{
          [p.id]: p.rate
            .div(DisplayRateVal[displayRate])
            .mul(item.stack ? item.stack.mul(WAGON_STACKS) : WAGON_FLUID),
        },
      };
    }, {});
  }
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsBy,
  Recipes.getAdjustedDataset,
  (products, data) => {
    return products[RateType.Factories]?.reduce((e: Entities<Rational>, p) => {
      const recipe = data.recipeR[p.itemId];
      if (recipe) {
        return {
          ...e,
          ...{
            [p.id]: p.rate.div(recipe.time).mul(recipe.out[p.itemId]),
          },
        };
      }
      // No matching recipe found
      // TODO: Block this option for complex products
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
        null,
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

export const getNormalizedNodes = createSelector(
  getProducts,
  getNormalizedRates,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Recipes.getAdjustedDataset,
  Settings.getFuel,
  (products, rates, itemSettings, recipeSettings, data, fuel) => {
    const root: any = { id: 'root', children: [] };
    for (const product of products) {
      RateUtility.addNodesFor(
        root,
        product.itemId,
        rates[product.id],
        itemSettings,
        recipeSettings,
        fuel,
        data
      );
    }
    return root;
  }
);

export const getNormalizedStepsWithMatrices = createSelector(
  getNormalizedSteps,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Recipes.getAdjustedDataset,
  Settings.getRecipeDisabled,
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

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithMatrices,
  Items.getItemSettings,
  Dataset.getBeltSpeed,
  (steps, itemSettings, beltSpeed) =>
    RateUtility.calculateBelts(steps, itemSettings, beltSpeed)
);

export const getNormalizedNodesWithBelts = createSelector(
  getNormalizedNodes,
  Items.getItemSettings,
  Dataset.getBeltSpeed,
  (nodes, itemSettings, beltSpeed) =>
    RateUtility.calculateNodeBelts(nodes, itemSettings, beltSpeed)
);

export const getSteps = createSelector(
  getNormalizedStepsWithBelts,
  Settings.getDisplayRate,
  (steps, displayRate) => RateUtility.displayRate(steps, displayRate)
);

export const getNodes = createSelector(
  getNormalizedNodesWithBelts,
  Settings.getDisplayRate,
  (nodes, displayRate) => RateUtility.nodeDisplayRate(nodes, displayRate)
);

export const getZipState = createSelector(
  getProducts,
  Items.itemsState,
  Recipes.recipesState,
  Settings.settingsState,
  Dataset.getDatasetState,
  (products, items, recipes, settings, data) => {
    return { products, items, recipes, settings, data };
  }
);
