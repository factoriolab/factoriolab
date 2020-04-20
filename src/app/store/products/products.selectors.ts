import { compose, createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { Step, RateType, NEntities, WAGON_STACKS, WAGON_FLUID } from '~/models';
import { OilUtility, RateUtility, UraniumUtility } from '~/utilities';
import * as Dataset from '../dataset';
import * as Recipe from '../recipe';
import * as Settings from '../settings';
import { State } from '../';
import { ProductsState } from './products.reducer';

/* Base selector functions */
const productsState = (state: State) => state.productsState;
const sIds = (state: ProductsState) => state.ids;
const sEntities = (state: ProductsState) => state.entities;
const sEditProductId = (state: ProductsState) => state.editProductId;
const sCategoryId = (state: ProductsState) => state.categoryId;

/* Simple selectors */
export const getIds = compose(sIds, productsState);
export const getEntities = compose(sEntities, productsState);
export const getEditProductId = compose(sEditProductId, productsState);
export const getCategoryId = compose(sCategoryId, productsState);

/* Complex selectors */
export const getProducts = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.map((i) => entities[i])
);

export const getProductsByItems = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.filter((i) => entities[i].rateType === RateType.Items)
);

export const getProductsByLanes = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.filter((i) => entities[i].rateType === RateType.Lanes)
);

export const getProductsByWagons = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.filter((i) => entities[i].rateType === RateType.Wagons)
);

export const getProductsByFactories = createSelector(
  getIds,
  getEntities,
  (ids, entities) =>
    ids.filter((i) => entities[i].rateType === RateType.Factories)
);

export const getNormalizedRatesByItems = createSelector(
  getProductsByItems,
  getEntities,
  Settings.getDisplayRate,
  (ids, entities, displayRate) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      return { ...e, ...{ [i]: entities[i].rate.div(displayRate) } };
    }, {});
  }
);

export const getNormalizedRatesByLanes = createSelector(
  getProductsByLanes,
  getEntities,
  Recipe.getRecipeSettings,
  Dataset.getLaneSpeed,
  (ids, entities, recipeSettings, laneSpeed) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const settings = recipeSettings[entities[i].itemId];
      return {
        ...e,
        ...{ [i]: entities[i].rate.mul(laneSpeed[settings.lane]) },
      };
    }, {});
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  getEntities,
  Settings.getDisplayRate,
  Dataset.getDataset,
  (ids, entities, displayRate, data) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const item = data.itemEntities[entities[i].itemId];
      return {
        ...e,
        ...{
          [i]: entities[i].rate
            .div(displayRate)
            .mul(item.stack ? item.stack * WAGON_STACKS : WAGON_FLUID),
        },
      };
    }, {});
  }
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsByFactories,
  getEntities,
  Recipe.getRecipeFactors,
  Dataset.getDataset,
  (ids, entities, factors, data) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const recipe = data.recipeEntities[entities[i].itemId];
      const o = recipe.out ? recipe.out[recipe.id] : 1;
      const f = factors[recipe.id];
      // TODO: Handle products with no specific recipe here (oil, etc)
      return {
        ...e,
        ...{
          [i]: entities[i].rate
            .div(recipe.time)
            .mul(o)
            .mul(f.speed)
            .mul(f.prod),
        },
      };
    }, {});
  }
);

export const getNormalizedRates = createSelector(
  getNormalizedRatesByItems,
  getNormalizedRatesByLanes,
  getNormalizedRatesByWagons,
  getNormalizedRatesByFactories,
  (byItems, byLanes, byWagons, byFactories) => {
    return { ...byItems, ...byLanes, ...byWagons, ...byFactories };
  }
);

export const getNormalizedSteps = createSelector(
  getProducts,
  getNormalizedRates,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getBelt,
  Settings.getOilRecipe,
  Dataset.getDataset,
  (products, rates, settings, factors, belt, oilRecipe, data) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        product.itemId,
        rates[product.id],
        steps,
        settings,
        factors,
        belt,
        oilRecipe,
        data
      );
    }
    return steps;
  }
);

export const getNormalizedStepsWithUranium = createSelector(
  getNormalizedSteps,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getBelt,
  Dataset.getDataset,
  (steps, settings, factors, belt, data) =>
    UraniumUtility.addSteps(steps, settings, factors, belt, data)
);

export const getNormalizedStepsWithOil = createSelector(
  getNormalizedStepsWithUranium,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getBelt,
  Settings.getOilRecipe,
  Dataset.getDataset,
  (steps, settings, factors, belt, oilRecipe, data) =>
    OilUtility.addSteps(oilRecipe, steps, settings, factors, belt, data)
);

export const getNormalizedStepsWithLanes = createSelector(
  getNormalizedStepsWithOil,
  Dataset.getLaneSpeed,
  (steps, laneSpeed) => RateUtility.calculateLanes(steps, laneSpeed)
);

export const getSteps = createSelector(
  getNormalizedStepsWithLanes,
  Settings.getDisplayRate,
  (steps, displayRate) => RateUtility.displayRate(steps, displayRate)
);
