import { compose, createSelector } from '@ngrx/store';

import { Step } from '~/models';
import { RateUtility } from '~/utilities/rate';
import { State } from '../';
import * as dataset from '../dataset';
import * as recipe from '../recipe';
import * as settings from '../settings';
import { ProductsState } from './products.reducer';

const productsState = (state: State) => state.productsState;
const ids = (state: ProductsState) => state.ids;
const entities = (state: ProductsState) => state.entities;
const editProductId = (state: ProductsState) => state.editProductId;
const categoryId = (state: ProductsState) => state.categoryId;

/* First order selectors */
export const getIds = compose(ids, productsState);

export const getEntities = compose(entities, productsState);

export const getEditProductId = compose(editProductId, productsState);

export const getCategoryId = compose(categoryId, productsState);

/* High order selectors */
export const getProducts = createSelector(
  getIds,
  getEntities,
  (sIds, sEntities) => sIds.map(i => sEntities[i])
);

export const getSteps = createSelector(
  getProducts,
  settings.getSettingsState,
  recipe.getRecipeSettings,
  recipe.getRecipeFactors,
  dataset.getLaneSpeed,
  dataset.getItemEntities,
  dataset.getRecipeEntities,
  (
    sProducts,
    sSettings,
    sRecipeSettings,
    sRecipeFactors,
    sLaneSpeed,
    sItemEntities,
    sRecipeEntities
  ) => {
    const steps: Step[] = [];
    for (const product of sProducts) {
      const item = sItemEntities[product.itemId];
      const itemRecipe = sRecipeEntities[item.id];
      const rate = RateUtility.normalizeRate(
        product.rate,
        product.rateType,
        sSettings.displayRate,
        item.stack,
        sItemEntities[sSettings.belt].belt.speed,
        sSettings.flowRate,
        itemRecipe,
        sRecipeFactors
      );
      RateUtility.addStepsFor(
        product.itemId,
        rate,
        sRecipeEntities[product.itemId],
        steps,
        sRecipeSettings,
        sLaneSpeed,
        sRecipeFactors,
        sItemEntities,
        sRecipeEntities,
        sSettings
      );
    }

    RateUtility.addOilSteps(
      sSettings.oilRecipe,
      steps,
      sRecipeSettings,
      sLaneSpeed,
      sRecipeFactors,
      sRecipeEntities
    );

    return RateUtility.displayRate(steps, sSettings.displayRate);
  }
);
