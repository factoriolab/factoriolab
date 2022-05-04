import { createSelector } from '@ngrx/store';

import { Entities, FactorySettings, Game } from '~/models';
import { LabState } from '../';
import * as Settings from '../settings';
import { FactoriesState } from './factories.reducer';

/* Base selector functions */
export const factoriesState = (state: LabState): FactoriesState =>
  state.factoriesState;

/* Complex selectors */
export const getFactories = createSelector(
  factoriesState,
  Settings.getDefaults,
  Settings.getDataset,
  (state, defaults, data): FactoriesState => {
    const ids = state.ids || defaults?.factoryRankIds || [];

    const entities: Entities<FactorySettings> = {};
    const def: FactorySettings = { ...state.entities[''] };
    def.moduleRankIds = def.moduleRankIds || defaults?.moduleRankIds || [];
    if (data.game === Game.Factorio) {
      def.beaconCount = def.beaconCount || defaults?.beaconCount;
    }
    def.beaconId = def.beaconId || defaults?.beaconId;
    def.beaconModuleId = def.beaconModuleId || defaults?.beaconModuleId;
    if (data.game === Game.Satisfactory) {
      // Default = 100%
      def.overclock = def.overclock || 100;
    }
    entities[''] = def;

    for (const id of data.factoryIds.filter((i) => data.itemEntities[i])) {
      const s: FactorySettings = { ...state.entities[id] };
      const factory = data.factoryEntities[id];

      if (factory.modules) {
        s.moduleRankIds = s.moduleRankIds || def.moduleRankIds;
        s.beaconCount = s.beaconCount != null ? s.beaconCount : def.beaconCount;
        s.beaconId = s.beaconId || def.beaconId;
        s.beaconModuleId = s.beaconModuleId || def.beaconModuleId;
      }

      s.overclock = s.overclock || def.overclock;

      entities[id] = s;
    }

    return { ids, entities };
  }
);

export const getFactoryOptions = createSelector(
  getFactories,
  Settings.getDataset,
  (factories, data) =>
    data.factoryIds.filter((f) => (factories.ids ?? []).indexOf(f) === -1)
);

export const getFactoryRows = createSelector(getFactories, (factories) => [
  '',
  ...(factories.ids ?? []),
]);
