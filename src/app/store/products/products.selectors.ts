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
import { RateUtility, SimplexUtility, FlowUtility } from '~/utilities';
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
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  (products, itemSettings, disabledRecipes, data) => {
    return products[RateType.Factories]?.reduce((e: Entities<Rational>, p) => {
      const recipe = data.recipeR[data.itemRecipeIds[p.itemId]];
      // Ensures matching recipe is found, else case should be blocked by UI
      if (recipe) {
        e[p.id] = p.rate
          .div(recipe.time)
          .mul(recipe.out[p.itemId])
          .div(recipe.adjustProd || Rational.one);
      } else {
        const recipes = SimplexUtility.getRecipes(
          p.itemId,
          itemSettings,
          disabledRecipes,
          data
        );

        if (recipes.length === 0) {
          // No matching recipes found, fall back to zero
          e[p.id] = Rational.zero;
        } else if (!p.recipeId) {
          // No recipe defined, use best recipe available
          e[p.id] = p.rate.div(recipes[0][1]);
        } else {
          const tuple = recipes.find((r) => r[0] === p.recipeId);
          if (tuple) {
            // Found matching result, calculate number of items
            e[p.id] = p.rate.div(tuple[1]);
          } else {
            // No match found for setting, fall back to best recipe
            e[p.id] = p.rate.div(recipes[0][1]);
          }
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
