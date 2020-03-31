import { compose, createSelector } from '@ngrx/store';

import { Step, RateType } from 'src/app/models';
import { Rate } from 'src/app/utilities/rate';
import { State } from '../';
import {
  getItemEntities,
  getItems,
  getBeltSpeed,
  getRecipeEntities
} from '../dataset';
import { getRecipeSettings, getRecipeFactors } from '../recipe';
import { getSettingsState } from '../settings';
import { ProductsState } from './products.reducer';
import Fraction from 'fraction.js';

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

export const getItemRows = createSelector(
  getCategoryId,
  getItems,
  (sCategoryId, sItems) => {
    const rows: string[][] = [[]];
    const items = sItems
      .filter(p => p.category === sCategoryId)
      .sort((a, b) => a.row - b.row);
    if (items.length) {
      let index = items[0].row;
      for (const item of items) {
        if (item.row > index) {
          rows.push([]);
          index = item.row;
        }
        rows[rows.length - 1].push(item.id);
      }
    }
    return rows;
  }
);

export const getSteps = createSelector(
  getSettingsState,
  getProducts,
  getRecipeSettings,
  getBeltSpeed,
  getRecipeFactors,
  getItemEntities,
  getRecipeEntities,
  (
    sSettings,
    sProducts,
    sRecipeSettings,
    sBeltSpeed,
    sRecipeFactors,
    sItemEntities,
    sRecipeEntities
  ) => {
    const steps: Step[] = [];
    for (const product of sProducts) {
      const item = sItemEntities[product.itemId];
      let rate = product.rate;
      switch (product.rateType) {
        case RateType.Items:
          rate = rate.div(sSettings.displayRate);
          break;
        case RateType.Factories:
          const recipe = sRecipeEntities[item.id];
          rate = Rate.toRate(
            rate,
            new Fraction(recipe.time),
            new Fraction(recipe.out ? recipe.out[item.id] : 1),
            sRecipeFactors[recipe.id]
          );
          break;
        case RateType.Belts:
          rate = rate.mul(
            item.stack
              ? sItemEntities[sSettings.belt].belt.speed
              : sSettings.flowRate
          );
          break;
        case RateType.Wagons:
          rate = rate
            .div(sSettings.displayRate)
            .mul(item.stack ? item.stack * 40 : 25000);
          break;
      }
      Rate.addStepsFor(
        product.itemId,
        rate,
        sRecipeEntities[product.itemId],
        steps,
        sRecipeSettings,
        sBeltSpeed,
        sRecipeFactors,
        sRecipeEntities
      );
    }

    // Restore display rate
    for (const step of steps) {
      step.items = step.items.mul(sSettings.displayRate);
    }
    return steps;
  }
);
