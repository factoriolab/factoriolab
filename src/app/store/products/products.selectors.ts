import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  NEntities,
  WAGON_STACKS,
  WAGON_FLUID,
  ItemId,
  RecipeId,
  Rational,
  DisplayRateVal,
  RationalProduct,
} from '~/models';
import { RateUtility, RecipeUtility, MatrixUtility } from '~/utilities';
import * as Dataset from '../dataset';
import * as Recipe from '../recipe';
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
  products.reduce((e: NEntities<RationalProduct[]>, p) => {
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
    return products[RateType.Items]?.reduce((e: NEntities<Rational>, p) => {
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
  Recipe.getRecipeSettings,
  Settings.getOilRecipe,
  Dataset.getBeltSpeed,
  (products, recipeSettings, oilRecipe, beltSpeed) => {
    return products[RateType.Belts]?.reduce((e: NEntities<Rational>, p) => {
      let belt: ItemId;
      switch (p.itemId) {
        case ItemId.HeavyOil:
        case ItemId.LightOil:
        case ItemId.PetroleumGas:
          belt = ItemId.Pipe;
          break;
        case ItemId.SolidFuel: {
          const recipeId =
            oilRecipe === RecipeId.BasicOilProcessing
              ? RecipeId.SolidFuelFromPetroleumGas
              : RecipeId.SolidFuelFromLightOil;
          belt = recipeSettings[recipeId].belt;
          break;
        }
        case ItemId.Uranium238: {
          const recipeId = RecipeId.UraniumProcessing;
          belt = recipeSettings[recipeId].belt;
          break;
        }
        case ItemId.Uranium235: {
          const recipeId = RecipeId.KovarexEnrichmentProcess;
          belt = recipeSettings[recipeId].belt;
          break;
        }
        default: {
          const recipeId = p.itemId as any;
          belt = recipeSettings[recipeId].belt;
          break;
        }
      }
      return {
        ...e,
        ...{
          [p.id]: p.rate.mul(beltSpeed[belt]),
        },
      };
    }, {});
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsBy,
  Settings.getDisplayRate,
  Dataset.getRationalDataset,
  (products, displayRate, data) => {
    return products[RateType.Wagons]?.reduce((e: NEntities<Rational>, p) => {
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
  Recipe.getAdjustedDataset,
  (products, data) => {
    return products[RateType.Factories]?.reduce((e: NEntities<Rational>, p) => {
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
  Recipe.getRecipeSettings,
  Recipe.getAdjustedDataset,
  Settings.getFuel,
  Settings.getOilRecipe,
  (products, rates, settings, data, fuel, oilRecipe) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        null,
        product.itemId,
        rates[product.id],
        steps,
        settings,
        fuel,
        oilRecipe,
        data
      );
    }
    return steps;
  }
);

export const getNormalizedNodes = createSelector(
  getProducts,
  getNormalizedRates,
  Recipe.getRecipeSettings,
  Recipe.getAdjustedDataset,
  Settings.getFuel,
  Settings.getOilRecipe,
  (products, rates, settings, data, fuel, oilRecipe) => {
    const root: any = { id: 'root', children: [] };
    for (const product of products) {
      RateUtility.addNodesFor(
        root,
        product.itemId,
        rates[product.id],
        settings,
        fuel,
        oilRecipe,
        data
      );
    }
    return root;
  }
);

export const getNormalizedStepsWithMatrices = createSelector(
  getNormalizedSteps,
  Recipe.getRecipeSettings,
  Recipe.getAdjustedDataset,
  Settings.getFuel,
  Settings.getOilRecipe,
  (steps, settings, data, fuel, oilRecipe) =>
    MatrixUtility.solveMatricesFor(steps, settings, fuel, oilRecipe, data)
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithMatrices,
  Dataset.getBeltSpeed,
  (steps, beltSpeed) => RateUtility.calculateBelts(steps, beltSpeed)
);

export const getNormalizedNodesWithBelts = createSelector(
  getNormalizedNodes,
  Dataset.getBeltSpeed,
  (nodes, beltSpeed) => RateUtility.calculateNodeBelts(nodes, beltSpeed)
);

export const getDisplayRateSteps = createSelector(
  getNormalizedStepsWithBelts,
  Settings.getDisplayRate,
  (steps, displayRate) => RateUtility.displayRate(steps, displayRate)
);

export const getRawNodes = createSelector(
  getNormalizedNodesWithBelts,
  Settings.getDisplayRate,
  (nodes, displayRate) => RateUtility.nodeDisplayRate(nodes, displayRate)
);

export const getNodes = createSelector(getRawNodes, (nodes) =>
  RecipeUtility.sortNode(nodes)
);

export const getSteps = createSelector(getDisplayRateSteps, (steps) =>
  RecipeUtility.sort(steps)
);

export const getZipState = createSelector(
  getProducts,
  Recipe.recipeState,
  Settings.settingsState,
  Dataset.getDatasetState,
  (products, recipe, settings, data) => {
    return { products, recipe, settings, data };
  }
);
