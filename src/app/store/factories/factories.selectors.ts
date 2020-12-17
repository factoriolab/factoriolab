import { createSelector } from '@ngrx/store';

import { Entities, FactorySettings } from '~/models';
import * as Settings from '../settings';
import { State } from '..';

/* Base selector functions */
export const factoriesState = (state: State) => state.factoriesState;

/* Complex selectors */
export const getFactoryOverrides = createSelector(
  factoriesState,
  Settings.getModuleRank,
  Settings.getBeaconCount,
  Settings.getBeacon,
  Settings.getBeaconModule,
  Settings.getDataset,
  (state, moduleRank, beaconCount, beacon, beaconModule, data) => {
    const entities: Entities<FactorySettings> = {};
    for (const id of Object.keys(state)) {
      const override = { ...state[id] };
      const factory = data.itemEntities[id].factory;
      if (factory.modules) {
        if (!override.moduleRank) {
          override.moduleRank = moduleRank;
        }

        if (override.beaconCount == null) {
          override.beaconCount = beaconCount;
        }

        if (!override.beacon) {
          override.beacon = beacon;
        }

        if (!override.beaconModule) {
          override.beaconModule = beaconModule;
        }
      }

      entities[id] = override;
    }
    return { ...state, ...{ entities } };
  }
);
