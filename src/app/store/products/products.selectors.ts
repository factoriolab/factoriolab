import { compose, createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import {
  Step,
  RateType,
  NEntities,
  WAGON_STACKS,
  WAGON_FLUID,
  ItemId,
  RecipeId,
  CategoryId,
} from '~/models';
import {
  OilUtility,
  RateUtility,
  UraniumUtility,
  OilMatrix,
  UraniumMatrix,
  RecipeUtility,
} from '~/utilities';
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

export const getProductsByItems = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.filter((i) => entities[i].rateType === RateType.Items)
);

export const getProductsByBelts = createSelector(
  getIds,
  getEntities,
  (ids, entities) => ids.filter((i) => entities[i].rateType === RateType.Belts)
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
      return {
        ...e,
        ...{ [i]: new Fraction(entities[i].rate).div(displayRate) },
      };
    }, {});
  }
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsByBelts,
  getEntities,
  Recipe.getRecipeSettings,
  Settings.getOilRecipe,
  Dataset.getBeltSpeed,
  (ids, entities, recipeSettings, oilRecipe, beltSpeed) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const itemId = entities[i].itemId;
      let belt: ItemId;
      switch (itemId) {
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
          const recipeId = itemId as any;
          belt = recipeSettings[recipeId].belt;
          break;
        }
      }
      return {
        ...e,
        ...{
          [i]: new Fraction(entities[i].rate).mul(beltSpeed[belt]),
        },
      };
    }, {});
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  getEntities,
  Settings.getDisplayRate,
  Dataset.datasetState,
  (ids, entities, displayRate, data) => {
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const item = data.itemEntities[entities[i].itemId];
      return {
        ...e,
        ...{
          [i]: new Fraction(entities[i].rate)
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
  Settings.getOilRecipe,
  Dataset.datasetState,
  (ids, entities, factors, oilRecipe, data) => {
    let oilMatrix: OilMatrix;
    let oilFactor: Fraction;
    let uraMatrix: UraniumMatrix;
    let uraFactor: Fraction;
    return ids.reduce((e: NEntities<Fraction>, i) => {
      const itemId = entities[i].itemId;
      const recipe = data.recipeEntities[itemId];
      if (recipe) {
        if (data.itemEntities[itemId].category === CategoryId.Research) {
          const f = factors[recipe.id];
          return {
            ...e,
            ...{
              [i]: new Fraction(entities[i].rate).div(recipe.time).mul(f.speed),
            },
          };
        } else {
          const o = recipe.out ? recipe.out[recipe.id] : 1;
          const f = factors[recipe.id];
          return {
            ...e,
            ...{
              [i]: new Fraction(entities[i].rate)
                .div(recipe.time)
                .mul(o)
                .mul(f.speed)
                .mul(f.prod),
            },
          };
        }
      } else if (OilUtility.OIL_ITEM.indexOf(itemId) !== -1) {
        if (!oilMatrix) {
          oilMatrix = OilUtility.getMatrix(oilRecipe, true, factors, data);
          oilFactor = factors[oilRecipe].speed.div(oilMatrix.oil.recipe.time);
        }
        switch (itemId) {
          case ItemId.HeavyOil:
            return { ...e, ...{ [i]: oilMatrix.oil.heavy.mul(oilFactor) } };
          case ItemId.LightOil:
            return { ...e, ...{ [i]: oilMatrix.hoc.max.mul(oilFactor) } };
          case ItemId.PetroleumGas:
            return { ...e, ...{ [i]: oilMatrix.loc.max.mul(oilFactor) } };
          case ItemId.SolidFuel:
            return { ...e, ...{ [i]: oilMatrix.ptf.max.mul(oilFactor) } };
        }
      } else if (UraniumUtility.URANIUM_ITEM.indexOf(itemId) !== -1) {
        if (!uraMatrix) {
          uraMatrix = UraniumUtility.getMatrix(factors, data);
          uraFactor = factors[RecipeId.UraniumProcessing].speed.div(
            uraMatrix.prod.recipe.time
          );
        }
        switch (itemId) {
          case ItemId.Uranium238:
            return { ...e, ...{ [i]: uraMatrix.prod.u238.mul(uraFactor) } };
          case ItemId.Uranium235:
            return { ...e, ...{ [i]: uraMatrix.conv.max.mul(uraFactor) } };
        }
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
  Recipe.getRecipeFactors,
  Settings.getBelt,
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.datasetState,
  (products, rates, settings, factors, belt, fuel, oilRecipe, data) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        product.itemId,
        rates[product.id],
        steps,
        settings,
        factors,
        belt,
        fuel,
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
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.datasetState,
  (steps, settings, factors, belt, fuel, oilRecipe, data) =>
    UraniumUtility.addSteps(
      steps,
      settings,
      factors,
      belt,
      fuel,
      oilRecipe,
      data
    )
);

export const getNormalizedStepsWithOil = createSelector(
  getNormalizedStepsWithUranium,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getBelt,
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.datasetState,
  (steps, settings, factors, belt, fuel, oilRecipe, data) =>
    OilUtility.addSteps(oilRecipe, steps, settings, factors, belt, fuel, data)
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithOil,
  Dataset.getBeltSpeed,
  (steps, beltSpeed) => RateUtility.calculateBelts(steps, beltSpeed)
);

export const getDisplayRateSteps = createSelector(
  getNormalizedStepsWithBelts,
  Settings.getDisplayRate,
  (steps, displayRate) => RateUtility.displayRate(steps, displayRate)
);

export const getSteps = createSelector(getDisplayRateSteps, (steps) =>
  RecipeUtility.sort(steps)
);

export const getZipState = createSelector(
  getProducts,
  Recipe.recipeState,
  Settings.settingsState,
  Dataset.datasetState,
  (products, recipe, settings, data) => {
    return { products, recipe, settings, data };
  }
);
