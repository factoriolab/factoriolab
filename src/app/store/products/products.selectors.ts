import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  Entities,
  Rational,
  DisplayRateVal,
  RationalProduct,
  Product,
} from '~/models';
import {
  RateUtility,
  SimplexUtility,
  FlowUtility,
  RecipeUtility,
} from '~/utilities';
import * as Factories from '../factories';
import * as Items from '../items';
import * as Preferences from '../preferences';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { State } from '../';
import { ProductsState } from './products.reducer';

/* Base selector functions */
const productsState = (state: State): ProductsState => state.productsState;
const sIds = (state: ProductsState): string[] => state.ids;
const sEntities = (state: ProductsState): Entities<Product> => state.entities;

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

export const getProductSteps = createSelector(
  getRationalProducts,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  (products, itemSettings, disabledRecipes, data) =>
    products?.reduce((e: Entities<[string, Rational][]>, p) => {
      e[p.itemId] = SimplexUtility.getSteps(
        p.itemId,
        itemSettings,
        disabledRecipes,
        data,
        p.rateType === RateType.Factories
      );
      return e;
    }, {})
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
  getProductSteps,
  Settings.getDisplayRate,
  (products, productSteps, displayRate) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const rate = p.rate.div(DisplayRateVal[displayRate]);
      if (p.viaId == null || p.viaId === p.itemId) {
        e[p.id] = rate;
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = rate.div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByBelts = createSelector(
  getProductsByBelts,
  getProductSteps,
  Items.getItemSettings,
  Settings.getBeltSpeed,
  (products, productSteps, itemSettings, beltSpeed) =>
    products?.reduce((e: Entities<Rational>, p) => {
      if (p.viaId == null || p.viaId === p.itemId) {
        e[p.id] = p.rate.mul(beltSpeed[itemSettings[p.itemId].belt]);
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = p.rate
            .mul(beltSpeed[itemSettings[p.viaId].belt])
            .div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByWagons = createSelector(
  getProductsByWagons,
  getProductSteps,
  Items.getItemSettings,
  Settings.getDisplayRate,
  Settings.getDataset,
  (products, productSteps, itemSettings, displayRate, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      if (p.viaId == null || p.viaId === p.itemId) {
        const item = data.itemR[p.itemId];
        const wagon = data.itemR[itemSettings[p.itemId].wagon];
        e[p.id] = p.rate
          .div(DisplayRateVal[displayRate])
          .mul(
            item.stack
              ? item.stack.mul(wagon.cargoWagon.size)
              : wagon.fluidWagon.capacity
          );
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          const item = data.itemR[p.viaId];
          const wagon = data.itemR[itemSettings[p.viaId].wagon];
          e[p.id] = p.rate
            .div(DisplayRateVal[displayRate])
            .mul(
              item.stack
                ? item.stack.mul(wagon.cargoWagon.size)
                : wagon.fluidWagon.capacity
            )
            .div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRatesByFactories = createSelector(
  getProductsByFactories,
  getProductSteps,
  Recipes.getAdjustedDataset,
  (products, productSteps, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const simpleRecipeId = data.itemRecipeIds[p.itemId];
      if (simpleRecipeId && (p.viaId == null || p.viaId === simpleRecipeId)) {
        const recipe = data.recipeR[simpleRecipeId];
        e[p.id] = p.rate
          .div(recipe.time)
          .mul(recipe.out[p.itemId])
          .div(recipe.adjustProd || Rational.one);
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = p.rate.div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }
      return e;
    }, {})
);

export const getNormalizedRates = createSelector(
  getNormalizedRatesByItems,
  getNormalizedRatesByBelts,
  getNormalizedRatesByWagons,
  getNormalizedRatesByFactories,
  (byItems, byBelts, byWagons, byFactories) => ({
    ...byItems,
    ...byBelts,
    ...byWagons,
    ...byFactories,
  })
);

export const getNormalizedSteps = createSelector(
  getProducts,
  getNormalizedRates,
  Items.getItemSettings,
  Recipes.getAdjustedDataset,
  (products, rates, itemSettings, data) => {
    const steps: Step[] = [];
    for (const product of products) {
      RateUtility.addStepsFor(
        product.itemId,
        rates[product.id],
        steps,
        itemSettings,
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

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithMatrices,
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
  Preferences.getLinkValue,
  Preferences.getLinkPrecision,
  Recipes.getAdjustedDataset,
  (steps, linkValue, linkPrecision, data) =>
    FlowUtility.buildSankey(
      RateUtility.copy(steps),
      linkValue,
      linkPrecision,
      data
    )
);

export const getZipState = createSelector(
  productsState,
  Items.itemsState,
  Recipes.recipesState,
  Factories.factoriesState,
  Settings.settingsState,
  (products, items, recipes, factories, settings) => ({
    products,
    items,
    recipes,
    factories,
    settings,
  })
);
