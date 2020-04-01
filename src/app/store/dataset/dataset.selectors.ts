import { compose, createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { State } from '../';
import { DatasetState } from './dataset.reducer';

const datasetState = (state: State) => state.datasetState;
const itemIds = (state: DatasetState) => state.itemIds;
const itemEntities = (state: DatasetState) => state.itemEntities;
const categoryIds = (state: DatasetState) => state.categoryIds;
const categoryEntities = (state: DatasetState) => state.categoryEntities;
const recipeIds = (state: DatasetState) => state.recipeIds;
const recipeEntities = (state: DatasetState) => state.recipeEntities;

/* First order selectors */
export const getItemIds = compose(itemIds, datasetState);

export const getItemEntities = compose(itemEntities, datasetState);

export const getCategoryIds = compose(categoryIds, datasetState);

export const getCategoryEntities = compose(categoryEntities, datasetState);

export const getRecipeIds = compose(recipeIds, datasetState);

export const getRecipeEntities = compose(recipeEntities, datasetState);

/* High order selectors */
export const getItems = createSelector(
  getItemIds,
  getItemEntities,
  (sItemIds, sItemEntities) => sItemIds.map(i => sItemEntities[i])
);

export const getCategories = createSelector(
  getCategoryIds,
  getCategoryEntities,
  (sCategoryIds, sCategoryEntities) =>
    sCategoryIds.map(i => sCategoryEntities[i])
);

export const getRecipes = createSelector(
  getRecipeIds,
  getRecipeEntities,
  (sRecipeIds, sRecipeEntities) => sRecipeIds.map(i => sRecipeEntities[i])
);

export const getCategoryItemRows = createSelector(
  getCategoryIds,
  getItems,
  (sIds, sItems) => {
    const map: { [id: string]: string[][] } = {};

    for (const id of sIds) {
      const rows: string[][] = [[]];
      const items = sItems
        .filter(p => p.category === id)
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
      map[id] = rows;
    }

    return map;
  }
);

export const getBeltIds = createSelector(
  getItemIds,
  getItemEntities,
  (sItemIds, sItemEntities) => sItemIds.filter(i => sItemEntities[i].belt)
);

export const getBeltSpeed = createSelector(
  getBeltIds,
  getItemEntities,
  (sBeltIds, sItemEntities) => {
    const value: { [id: string]: Fraction } = {};
    for (const id of sBeltIds) {
      value[id] = new Fraction(sItemEntities[id].belt.speed);
    }
    return value;
  }
);
