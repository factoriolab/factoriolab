import { createSelector } from '@ngrx/store';
import { SelectItem } from 'primeng/api';

import { getIdOptions } from '~/helpers';
import { Entities, FactorySettings, Game } from '~/models';
import { RecipeUtility } from '~/utilities';
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
    const ids = state.ids ?? defaults?.factoryRankIds ?? [];

    const entities: Entities<FactorySettings> = {};
    const def: FactorySettings = { ...state.entities[''] };
    def.moduleRankIds = def.moduleRankIds ?? defaults?.moduleRankIds ?? [];
    def.moduleOptions = getIdOptions(data.moduleIds, data.itemEntities, true);
    if (data.game === Game.Factorio) {
      def.beaconCount = def.beaconCount ?? defaults?.beaconCount;
    }
    def.beaconId = def.beaconId ?? defaults?.beaconId;
    def.beaconModuleRankIds =
      def.beaconModuleRankIds ?? (defaults ? [defaults.beaconModuleId] : []);
    if (def.beaconId) {
      const beacon = data.beaconEntities[def.beaconId];
      def.beaconModuleOptions = RecipeUtility.moduleOptions(beacon, null, data);
    }

    if (data.game === Game.Satisfactory) {
      // Default = 100%
      def.overclock = def.overclock ?? 100;
    }
    entities[''] = def;

    for (const id of data.factoryIds.filter((i) => data.itemEntities[i])) {
      const s: FactorySettings = { ...state.entities[id] };
      const factory = data.factoryEntities[id];

      if (factory.modules) {
        s.moduleRankIds = s.moduleRankIds ?? def.moduleRankIds;
        s.moduleOptions = RecipeUtility.moduleOptions(factory, null, data);
        s.beaconCount = s.beaconCount != null ? s.beaconCount : def.beaconCount;
        s.beaconId = s.beaconId ?? def.beaconId;
        s.beaconModuleRankIds =
          s.beaconModuleRankIds ?? def.beaconModuleRankIds;
        if (s.beaconId) {
          const beacon = data.beaconEntities[s.beaconId];
          s.beaconModuleOptions = RecipeUtility.moduleOptions(
            beacon,
            null,
            data
          );
        }
      }

      s.overclock = s.overclock ?? def.overclock;

      entities[id] = s;
    }

    return { ids, entities };
  }
);

export const getFactoryOptions = createSelector(
  getFactories,
  Settings.getDataset,
  (factories, data) =>
    data.factoryIds.map(
      (f): SelectItem => ({
        label: data.itemEntities[f].name,
        value: f,
        disabled: (factories.ids ?? []).indexOf(f) !== -1,
      })
    )
);

export const getFactoryRows = createSelector(getFactories, (factories) => [
  '',
  ...(factories.ids ?? []),
]);
