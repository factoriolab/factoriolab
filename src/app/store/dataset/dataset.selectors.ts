import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { Entities, ItemId } from '~/models';
import * as Settings from '../settings';
import { State } from '../';

/* Base selector functions */
export const getDataset = (state: State) => state.datasetState;

/* Complex selectors */
export const getBeltSpeed = createSelector(
  getDataset,
  Settings.getFlowRate,
  (data, flowRate) => {
    const value: Entities<Fraction> = {};
    if (data.beltIds) {
      for (const id of data.beltIds) {
        if (id === ItemId.Pipe) {
          value[id] = new Fraction(flowRate);
        } else {
          value[id] = new Fraction(data.itemEntities[id].belt.speed);
        }
      }
    }
    return value;
  }
);
