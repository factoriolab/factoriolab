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
} from '~/models';
import {
  RateUtility,
  SimplexUtility,
  FlowUtility,
  RecipeUtility,
} from '~/utilities';
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

export const getProductsByItems = createSelector(
  getProductsBy,
  (products) => products[RateType.Items]
);

export const getProductsByBelts = createSelector(
  getProductsBy,
  (products) => products[RateType.Belts]
);

export const getProductsByWagons = createSelector(
  getProductsBy,
  (products) => products[RateType.Wagons]
);

export const getProductsByFactories = createSelector(
  getProductsBy,
  (products) => products[RateType.Factories]
);

export const getNormalizedRatesByItems = createSelector(
  getProductsByItems,
  Settings.getDisplayRate,
  (products, displayRate) => {
    return products?.reduce((e: Entities<Rational>, p) => {
      e[p.id] = p.rate.div(DisplayRateVal[displayRate]);
      return e;
    }, {});
  }
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsByBelts,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  (products, itemSettings, beltSpeed) => {
    return products?.reduce((e: Entities<Rational>, p) => {
      e[p.id] = p.rate.mul(beltSpeed[itemSettings[p.itemId].belt]);
      return e;
    }, {});
  }
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  Settings.getDisplayRate,
  Settings.getDataset,
  (products, displayRate, data) => {
    return products?.reduce((e: Entities<Rational>, p) => {
      const item = data.itemR[p.itemId];
      e[p.id] = p.rate
        .div(DisplayRateVal[displayRate])
        .mul(item.stack ? item.stack.mul(WAGON_STACKS) : WAGON_FLUID);
      return e;
    }, {});
  }
);

export const getComplexItemRecipes = createSelector(
  getProductsByFactories,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  (products, itemSettings, disabledRecipes, data) => {
    return products
      ?.filter((p) => !data.recipeR[data.itemRecipeIds[p.itemId]])
      .reduce((e: Entities<[string, Rational][]>, p) => {
        e[p.itemId] = SimplexUtility.getRecipes(
          p.itemId,
          itemSettings,
          disabledRecipes,
          data
        );
        return e;
      }, {});
  }
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsBy,
  getComplexItemRecipes,
  Recipes.getAdjustedDataset,
  (products, complexRecipes, data) => {
    return products[RateType.Factories]?.reduce((e: Entities<Rational>, p) => {
      const recipe = data.recipeR[data.itemRecipeIds[p.itemId]];
      // Ensures matching recipe is found, else case should be blocked by UI
      if (recipe) {
        e[p.id] = p.rate
          .div(recipe.time)
          .mul(recipe.out[p.itemId])
          .div(recipe.adjustProd || Rational.one);
      } else {
        const recipes = complexRecipes[p.itemId];
        const data = RecipeUtility.getComplexRecipeData(recipes, p.recipeId);
        if (data) {
          e[p.id] = p.rate.div(data[1]);
        } else {
          e[p.id] = Rational.zero;
        }
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
  Recipes.getAdjustedDataset,
  Settings.getDisabledRecipes,
  (steps, itemSettings, data, disabledRecipes) =>
    SimplexUtility.solve(
      RateUtility.copy(steps),
      itemSettings,
      disabledRecipes,
      data
    )
);

export const getNormalizedStepsSorted = createSelector(
  getNormalizedStepsWithMatrices,
  Settings.getSort,
  (steps, sort) => {
    steps = RateUtility.copy(steps);
    if (sort === Sort.BreadthFirst) {
      return steps.sort((a, b) => a.depth - b.depth);
    }
    return steps;
  }
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsSorted,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  Recipes.getAdjustedDataset,
  (steps, itemSettings, beltSpeed, data) =>
    RateUtility.calculateBelts(
      RateUtility.copy(steps),
      itemSettings,
      beltSpeed,
      data
    )
);

export const getSteps = createSelector(
  getNormalizedStepsWithBelts,
  Settings.getDisplayRate,
  (steps, displayRate) =>
    RateUtility.displayRate(RateUtility.copy(steps), displayRate)
);

export const getSankey = createSelector(
  getSteps,
  Settings.getLinkValue,
  Recipes.getAdjustedDataset,
  (steps, linkValue, data) =>
    FlowUtility.buildSankey(RateUtility.copy(steps), linkValue, data)
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
