import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  NEntities,
  WAGON_STACKS,
  WAGON_FLUID,
  ItemId,
  RecipeId,
  CategoryId,
  Rational,
  DisplayRateVal,
  RationalProduct,
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
  Recipe.getRecipeFactors,
  Settings.getOilRecipe,
  Dataset.getRationalDataset,
  (products, factors, oilRecipe, data) => {
    let oilMatrix: OilMatrix;
    let oilFactor: Rational;
    let uraMatrix: UraniumMatrix;
    let uraFactor: Rational;
    return products[RateType.Factories]?.reduce((e: NEntities<Rational>, p) => {
      const recipe = data.recipeR[p.itemId];
      if (recipe) {
        if (data.itemEntities[p.itemId].category === CategoryId.Research) {
          const f = factors[recipe.id];
          return {
            ...e,
            ...{
              [p.id]: p.rate.div(recipe.time).mul(f.speed),
            },
          };
        } else {
          const o = recipe.out ? recipe.out[recipe.id] : Rational.one;
          const f = factors[recipe.id];
          return {
            ...e,
            ...{
              [p.id]: p.rate.div(recipe.time).mul(o).mul(f.speed).mul(f.prod),
            },
          };
        }
      } else if (OilUtility.OIL_ITEM.indexOf(p.itemId) !== -1) {
        if (!oilMatrix) {
          oilMatrix = OilUtility.getMatrix(oilRecipe, true, factors, data);
          oilFactor = factors[oilRecipe].speed.div(oilMatrix.oil.recipe.time);
        }
        switch (p.itemId) {
          case ItemId.HeavyOil:
            return { ...e, ...{ [p.id]: oilMatrix.oil.heavy.mul(oilFactor) } };
          case ItemId.LightOil:
            return { ...e, ...{ [p.id]: oilMatrix.hoc.max.mul(oilFactor) } };
          case ItemId.PetroleumGas:
            return { ...e, ...{ [p.id]: oilMatrix.loc.max.mul(oilFactor) } };
          case ItemId.SolidFuel:
            return { ...e, ...{ [p.id]: oilMatrix.ptf.max.mul(oilFactor) } };
        }
      } else if (UraniumUtility.URANIUM_ITEM.indexOf(p.itemId) !== -1) {
        if (!uraMatrix) {
          uraMatrix = UraniumUtility.getMatrix(factors, data);
          uraFactor = factors[RecipeId.UraniumProcessing].speed.div(
            uraMatrix.prod.recipe.time
          );
        }
        switch (p.itemId) {
          case ItemId.Uranium238:
            return { ...e, ...{ [p.id]: uraMatrix.prod.u238.mul(uraFactor) } };
          case ItemId.Uranium235:
            return { ...e, ...{ [p.id]: uraMatrix.conv.max.mul(uraFactor) } };
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
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.getRationalDataset,
  (products, rates, settings, factors, fuel, oilRecipe, data) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        null,
        product.itemId,
        rates[product.id],
        steps,
        settings,
        factors,
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
  Recipe.getRecipeFactors,
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.getRationalDataset,
  (products, rates, settings, factors, fuel, oilRecipe, data) => {
    const root: any = { id: 'root', children: [] };
    for (const product of products) {
      RateUtility.addNodesFor(
        root,
        product.itemId,
        rates[product.id],
        settings,
        factors,
        fuel,
        oilRecipe,
        data
      );
    }
    return root;
  }
);

export const getNormalizedStepsWithUranium = createSelector(
  getNormalizedSteps,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.getRationalDataset,
  (steps, settings, factors, fuel, oilRecipe, data) =>
    UraniumUtility.addSteps(steps, settings, factors, fuel, oilRecipe, data)
);

export const getNormalizedStepsWithOil = createSelector(
  getNormalizedStepsWithUranium,
  Recipe.getRecipeSettings,
  Recipe.getRecipeFactors,
  Settings.getFuel,
  Settings.getOilRecipe,
  Dataset.getRationalDataset,
  (steps, settings, factors, fuel, oilRecipe, data) =>
    OilUtility.addSteps(oilRecipe, steps, settings, factors, fuel, data)
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithOil,
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
