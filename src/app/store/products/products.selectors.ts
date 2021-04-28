import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  Entities,
  Rational,
  DisplayRateVal,
  RationalProduct,
  Product,
  Dataset,
  RationalRecipe,
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
  Recipes.getRecipeSettings,
  Factories.getFactorySettings,
  Settings.getNormalDataset,
  (ids, entities, recipeSettings, factories, data) =>
    ids
      .map((i) => entities[i])
      .filter((p) => data.itemEntities[p.itemId])
      .map((p) =>
        RecipeUtility.adjustProduct(p, recipeSettings, factories, data)
      )
);

export const getRationalProducts = createSelector(getProducts, (products) =>
  products.map((p) => new RationalProduct(p))
);

export const getProductDataset = createSelector(
  getRationalProducts,
  Recipes.getAdjustedDataset,
  Recipes.getRationalRecipeSettings,
  Settings.getFuel,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getDataset,
  (products, data, recipeSettings, fuel, miningBonus, researchSpeed, data2) =>
    products?.reduce((e: Entities<Dataset>, p) => {
      // Note: Ensure that viaId is set for a product before modifying factory settings
      // Otherwise, it is impractical to determine which recipe to modify
      if (
        p.rateType === RateType.Factories &&
        p.viaId &&
        (p.viaSetting ||
          p.viaFactoryModules ||
          p.viaBeaconCount ||
          p.viaBeacon ||
          p.viaBeaconModules)
      ) {
        const customSettings = {
          ...recipeSettings,
          ...{
            [p.viaId]: {
              ...recipeSettings[p.viaId],
              ...{
                factory: p.viaSetting,
                factoryModules: p.viaFactoryModules,
                beaconCount: p.viaBeaconCount,
                beacon: p.viaBeacon,
                beaconModules: p.viaBeaconModules,
              },
            },
          },
        };
        e[p.id] = {
          ...data2,
          ...{
            recipeR: RecipeUtility.adjustSiloRecipes(
              data.recipeIds.reduce((e: Entities<RationalRecipe>, i) => {
                e[i] = RecipeUtility.adjustRecipe(
                  i,
                  fuel,
                  miningBonus,
                  researchSpeed,
                  customSettings[i],
                  data2
                );
                return e;
              }, {}),
              customSettings
            ),
          },
        };
      } else {
        e[p.id] = data;
      }
      return e;
    }, {})
);

export const getProductSteps = createSelector(
  getRationalProducts,
  getProductDataset,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  (products, data, itemSettings, disabledRecipes) =>
    products?.reduce((e: Entities<[string, Rational][]>, p) => {
      e[p.itemId] = SimplexUtility.getSteps(
        p.itemId,
        itemSettings,
        disabledRecipes,
        data[p.id],
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
        e[p.id] = p.rate.mul(
          beltSpeed[p.viaSetting || itemSettings[p.itemId].belt]
        );
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = p.rate
            .mul(beltSpeed[itemSettings[via[0]].belt])
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
        const wagon = data.itemR[p.viaSetting || itemSettings[p.itemId].wagon];
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
          const item = data.itemR[via[0]];
          const wagon = data.itemR[p.viaSetting || itemSettings[via[0]].wagon];
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
  getProductDataset,
  (products, productSteps, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const simpleRecipeId = data[p.id].itemRecipeIds[p.itemId];
      if (simpleRecipeId && (p.viaId == null || p.viaId === simpleRecipeId)) {
        const recipe = data[p.id].recipeR[simpleRecipeId];
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

export const getNormalizedStepsWithSimplex = createSelector(
  getNormalizedSteps,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  Preferences.getSimplex,
  (steps, itemSettings, disabledRecipes, data, simplex) =>
    simplex
      ? SimplexUtility.solve(
          RateUtility.copy(steps),
          itemSettings,
          disabledRecipes,
          data
        )
      : steps
);

export const getNormalizedStepsWithBelts = createSelector(
  getNormalizedStepsWithSimplex,
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

export const getNormalizedStepsWithOutputs = createSelector(
  getNormalizedStepsWithBelts,
  Recipes.getAdjustedDataset,
  (steps, data) => RateUtility.calculateOutputs(RateUtility.copy(steps), data)
);

export const getSteps = createSelector(
  getNormalizedStepsWithOutputs,
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
