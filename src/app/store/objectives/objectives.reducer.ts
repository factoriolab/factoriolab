import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities } from '~/models/entities';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import { resetBeacons, resetMachines } from '../recipes/recipes.actions';
import { setMod } from '../settings/settings.actions';
import {
  add,
  adjustDisplayRate,
  create,
  remove,
  resetObjective,
  setBeacons,
  setFuel,
  setMachine,
  setModules,
  setOrder,
  setOverclock,
  setTarget,
  setType,
  setUnit,
  setValue,
} from './objectives.actions';

export interface ObjectivesState {
  ids: string[];
  entities: Entities<Objective>;
  index: number;
}

export const initialObjectivesState: ObjectivesState = {
  ids: [],
  entities: {},
  index: 0,
};

export const objectivesReducer = createReducer(
  initialObjectivesState,
  on(load, (_, { partial }) =>
    spread(initialObjectivesState, partial.objectivesState ?? {}),
  ),
  on(reset, setMod, (): ObjectivesState => initialObjectivesState),
  on(add, (state, { objective }) => {
    let value = rational.one;
    if (state.ids.length)
      value = state.entities[state.ids[state.ids.length - 1]].value;

    return spread(state, {
      ids: [...state.ids, state.index.toString()],
      entities: spread(state.entities, {
        [state.index]: {
          id: state.index.toString(),
          targetId: objective.targetId,
          value,
          unit: objective.unit,
          type: objective.type ?? ObjectiveType.Output,
        },
      }),
      index: state.index + 1,
    });
  }),
  on(create, (state, { objective }) => {
    // Use full objective, but enforce id: '0'
    objective = spread(objective, { id: '0' });
    return spread(state, {
      ids: [objective.id],
      entities: { [objective.id]: objective },
      index: 1,
    });
  }),
  on(remove, (state, { id }) =>
    spread(state, {
      ids: state.ids.filter((i) => i !== id),
      entities: StoreUtility.removeEntry(state.entities, id),
    }),
  ),
  on(setOrder, (state, { ids }) => spread(state, { ids })),
  on(setTarget, (state, { id, value }) => {
    const entities = StoreUtility.assignValue(
      state.entities,
      'targetId',
      id,
      value,
    );
    return spread(state, {
      entities: StoreUtility.resetFields(
        entities,
        ['machineId', 'modules', 'beacons', 'overclock'],
        id,
      ),
    });
  }),
  on(setValue, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.assignValue(state.entities, 'value', id, value),
    }),
  ),
  on(setUnit, (state, { id, objective }) => {
    let entities = StoreUtility.assignValue(
      state.entities,
      'targetId',
      id,
      objective.targetId,
    );
    entities = StoreUtility.assignValue(entities, 'unit', id, objective.unit);
    return spread(state, { entities });
  }),
  on(setType, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.assignValue(state.entities, 'type', id, value),
    }),
  ),
  on(setMachine, (state, { id, value, def }) => {
    let entities = StoreUtility.compareReset(
      state.entities,
      'machineId',
      id,
      value,
      def,
    );
    entities = StoreUtility.resetFields(entities, ['modules', 'beacons']);
    return spread(state, { entities });
  }),
  on(setFuel, (state, { id, value, def }) =>
    spread(state, {
      entities: StoreUtility.compareReset(
        state.entities,
        'fuelId',
        id,
        value,
        def,
      ),
    }),
  ),
  on(setModules, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'modules', id, value),
    }),
  ),
  on(setBeacons, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'beacons', id, value),
    }),
  ),
  on(setOverclock, (state, { id, value, def }) =>
    spread(state, {
      entities: StoreUtility.compareReset(
        state.entities,
        'overclock',
        id,
        value,
        def,
      ),
    }),
  ),
  on(resetObjective, (state, { id }) =>
    spread(state, {
      entities: StoreUtility.resetFields(
        state.entities,
        ['machineId', 'overclock', 'modules', 'beacons'],
        id,
      ),
    }),
  ),
  on(adjustDisplayRate, (state, { factor }) => {
    const entities = spread(state.entities);
    for (const objective of state.ids
      .map((i) => state.entities[i])
      .filter(
        (o) =>
          o.type !== ObjectiveType.Maximize &&
          (o.unit === ObjectiveUnit.Items || o.unit === ObjectiveUnit.Wagons),
      )) {
      const value = objective.value.mul(factor);
      entities[objective.id] = spread(objective, { value });
    }
    return spread(state, { entities });
  }),
  on(resetMachines, (state) =>
    spread(state, {
      entities: StoreUtility.resetFields(state.entities, [
        'machineId',
        'overclock',
        'modules',
        'beacons',
      ]),
    }),
  ),
  on(resetBeacons, (state) =>
    spread(state, {
      entities: StoreUtility.resetField(state.entities, 'beacons'),
    }),
  ),
);
