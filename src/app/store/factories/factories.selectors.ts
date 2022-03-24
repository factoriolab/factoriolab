import { createSelector } from '@ngrx/store';

import { Entities, FactorySettings, Game } from '~/models';
import * as Settings from '../settings';
import { LabState } from '..';
import { FactoriesState } from './factories.reducer';

/* Base selector functions */
export const factoriesState = (state: LabState): FactoriesState =>
  state.factoriesState;

/* Complex selectors */
export const getFactorySettings = createSelector(
  factoriesState,
  Settings.getDefaults,
  Settings.getDataset,
  (state, defaults, data): FactoriesState => {
    const ids = state.ids || defaults?.factoryRank || [];

    const entities: Entities<FactorySettings> = {};
    const def: FactorySettings = { ...state.entities[''] };
    def.moduleRank = def.moduleRank || defaults?.moduleRank || [];
    def.beaconCount =
      data.game === Game.Factorio
        ? def.beaconCount || defaults?.beaconCount
        : null;
    def.beacon = def.beacon || defaults?.beacon;
    def.beaconModule = def.beaconModule || defaults?.beaconModule;
    def.overclock =
      data.game === Game.Satisfactory
        ? def.overclock
          ? def.overclock
          : 100 // Default = 100%
        : null;
    entities[''] = def;

    for (const id of data.factoryIds.filter((i) => data.itemEntities[i])) {
      const s: FactorySettings = { ...state.entities[id] };
      const factory = data.itemEntities[id].factory;

      if (factory.modules) {
        s.moduleRank = s.moduleRank || def.moduleRank;
        s.beaconCount = s.beaconCount != null ? s.beaconCount : def.beaconCount;
        s.beacon = s.beacon || def.beacon;
        s.beaconModule = s.beaconModule || def.beaconModule;
      }

      s.overclock = s.overclock || def.overclock;

      entities[id] = s;
    }

    return { ids, entities };
  }
);
