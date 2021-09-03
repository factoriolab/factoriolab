import { compose, createSelector } from '@ngrx/store';

import {
  Step,
  RateType,
  Entities,
  Rational,
  DisplayRateVal,
  RationalProduct,
  Product,
  MatrixResultType,
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
export const getBaseProducts = createSelector(
  getIds,
  getEntities,
  Settings.getNormalDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.itemEntities[p.itemId])
);

export const getProductSteps = createSelector(
  getBaseProducts,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  Preferences.getSimplexModifiers,
  (products, itemSettings, disabledRecipes, data, adj) =>
    products?.reduce((e: Entities<[string, Rational][]>, p) => {
      e[p.itemId] = SimplexUtility.getSteps(
        p.itemId,
        itemSettings,
        disabledRecipes,
        adj.costInput,
        adj.costIgnored,
        data,
        p.rateType === RateType.Factories,
        adj.simplex
      );
      return e;
    }, {})
);

export const getProducts = createSelector(
  getBaseProducts,
  getProductSteps,
  Recipes.getRecipeSettings,
  Factories.getFactorySettings,
  Settings.getNormalDataset,
  (products, productSteps, recipeSettings, factories, data) =>
    products?.map((p) =>
      RecipeUtility.adjustProduct(
        p,
        productSteps,
        recipeSettings,
        factories,
        data
      )
    )
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
  getProductSteps,
  Settings.getDisplayRate,
  (products, productSteps, displayRate) =>
    products?.reduce((e: Entities<Rational>, p) => {
      const rate = p.rate.div(DisplayRateVal[displayRate]);
      if (p.viaId === p.itemId) {
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
      if (p.viaId === p.itemId) {
        e[p.id] = p.rate.mul(
          beltSpeed[p.viaSetting || itemSettings[p.itemId].belt]
        );
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          e[p.id] = p.rate
            .mul(beltSpeed[p.viaSetting || itemSettings[via[0]].belt])
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
      if (p.viaId === p.itemId) {
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
  Recipes.getRationalRecipeSettings,
  Settings.getAdjustmentData,
  Recipes.getAdjustedDataset,
  (products, productSteps, recipeSettings, adj, data) =>
    products?.reduce((e: Entities<Rational>, p) => {
      let recipeId = data.itemRecipeIds[p.itemId];
      if (recipeId && p.viaId === recipeId) {
        const recipe = data.recipeR[recipeId];
        e[p.id] = p.rate.div(recipe.time).mul(recipe.out[p.itemId]);
        if (recipe.adjustProd) {
          e[p.id] = e[p.id].div(recipe.productivity);
        }
      } else {
        const via = RecipeUtility.getProductStepData(productSteps, p);
        if (via) {
          recipeId = via[0];
          e[p.id] = p.rate.div(via[1]);
        } else {
          e[p.id] = Rational.zero;
        }
      }

      // Adjust based on product recipe settings
      if (recipeId && p.viaSetting) {
        const customSettings = {
          ...recipeSettings,
          ...{
            [recipeId]: {
              ...{
                factory: p.viaSetting,
                factoryModules: p.viaFactoryModules,
                beaconCount: p.viaBeaconCount,
                beacon: p.viaBeacon,
                beaconModules: p.viaBeaconModules,
                overclock: p.viaOverclock,
              },
            },
          },
        };
        const recipeR = RecipeUtility.adjustRecipes(
          customSettings,
          adj.fuel,
          adj.miningBonus,
          adj.researchSpeed,
          adj.data
        );
        const oldRecipe = data.recipeR[recipeId];
        const newRecipe = recipeR[recipeId];
        const ratio = newRecipe.productivity
          .div(newRecipe.time)
          .div(oldRecipe.productivity)
          .mul(oldRecipe.time);
        e[p.id] = e[p.id].mul(ratio);
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

export const getMatrixResult = createSelector(
  getNormalizedSteps,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Recipes.getAdjustedDataset,
  Preferences.getSimplexModifiers,
  (steps, itemSettings, disabledRecipes, data, adj) =>
    adj.simplex
      ? SimplexUtility.solve(
          RateUtility.copy(steps),
          itemSettings,
          disabledRecipes,
          adj.costInput,
          adj.costIgnored,
          data
        )
      : { steps, result: MatrixResultType.Skipped }
);

export const getNormalizedStepsWithBelts = createSelector(
  getMatrixResult,
  Items.getItemSettings,
  Recipes.getRecipeSettings,
  Settings.getBeltSpeed,
  Recipes.getAdjustedDataset,
  (result, itemSettings, recipeSettings, beltSpeed, data) =>
    RateUtility.calculateBelts(
      RateUtility.copy(result.steps),
      itemSettings,
      recipeSettings,
      beltSpeed,
      data
    )
);

export const getNormalizedStepsWithOutputs = createSelector(
  getNormalizedStepsWithBelts,
  Recipes.getAdjustedDataset,
  (steps, data) => RateUtility.calculateOutputs(RateUtility.copy(steps), data)
);

export const getNormalizedStepsWithBeacons = createSelector(
  getNormalizedStepsWithOutputs,
  Settings.getRationalBeaconReceivers,
  Recipes.getRationalRecipeSettings,
  Recipes.getAdjustedDataset,
  (steps, beaconReceivers, recipeSettings, data) =>
    RateUtility.calculateBeacons(
      RateUtility.copy(steps),
      beaconReceivers,
      recipeSettings,
      data
    )
);

export const getSteps = createSelector(
  getNormalizedStepsWithBeacons,
  Settings.getDisplayRate,
  (steps, displayRate) =>
    RateUtility.sortHierarchy(
      RateUtility.displayRate(RateUtility.copy(steps), displayRate)
    )
);

export const getSankey = createSelector(
  getSteps,
  Preferences.getLinkSize,
  Preferences.getLinkText,
  Preferences.getLinkPrecision,
  Recipes.getAdjustedDataset,
  (steps, linkSize, linkText, linkPrecision, data) =>
    FlowUtility.buildSankey(
      RateUtility.copy(steps),
      linkSize,
      linkText,
      linkPrecision,
      data
    )
);

export const checkViaState = createSelector(
  getRationalProducts,
  getNormalizedRates,
  (products, rates) => ({ products, rates })
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
