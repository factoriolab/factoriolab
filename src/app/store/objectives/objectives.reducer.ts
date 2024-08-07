import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import {
  Entities,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  rational,
} from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Items from '../items';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import * as Actions from './objectives.actions';

export interface ObjectivesState {
  ids: string[];
  entities: Entities<Objective>;
  index: number;
}

export const initialState: ObjectivesState = {
  ids: [],
  entities: {},
  index: 0,
};

export const objectivesReducer = createReducer(
  initialState,
  on(App.load, (_, { partial }) =>
    spread(initialState, partial.objectivesState ?? {}),
  ),
  on(App.reset, Settings.setMod, (): ObjectivesState => initialState),
  on(Actions.add, (state, { objective }) => {
    let value = rational.one;
    if (state.ids.length)
      value = state.entities[state.ids[state.ids.length - 1]].value;

    return spread(state, {
      ids: [...state.ids, state.index.toString()],
      entities: {
        ...state.entities,
        ...{
          [state.index]: {
            id: state.index.toString(),
            targetId: objective.targetId,
            value,
            unit: objective.unit,
            type: objective.type ?? ObjectiveType.Output,
          },
        },
      },
      index: state.index + 1,
    });
  }),
  on(Actions.create, (state, { objective }) => {
    // Use full objective, but enforce id: '0'
    objective = spread(objective, { id: '0' });
    return spread(state, {
      ids: [objective.id],
      entities: { [objective.id]: objective },
      index: 1,
    });
  }),
  on(Actions.remove, (state, { id }) =>
    spread(state, {
      ids: state.ids.filter((i) => i !== id),
      entities: StoreUtility.removeEntry(state.entities, id),
    }),
  ),
  on(Actions.setOrder, (state, { ids }) => spread(state, { ids })),
  on(Actions.setTarget, (state, { id, value }) => {
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
  on(Actions.setValue, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.assignValue(state.entities, 'value', id, value),
    }),
  ),
  on(Actions.setUnit, (state, { id, objective }) => {
    let entities = StoreUtility.assignValue(
      state.entities,
      'targetId',
      id,
      objective.targetId,
    );
    entities = StoreUtility.assignValue(entities, 'unit', id, objective.unit);
    return spread(state, { entities });
  }),
  on(Actions.setType, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.assignValue(state.entities, 'type', id, value),
    }),
  ),
  on(Actions.setMachine, (state, { id, value, def }) => {
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
  on(Actions.setFuel, (state, { id, value, def }) =>
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
  on(Actions.setModules, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'modules', id, value),
    }),
  ),
  on(Actions.setBeacons, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'beacons', id, value),
    }),
  ),
  on(Actions.setOverclock, (state, { id, value, def }) =>
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
  on(Actions.setChecked, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.compareReset(
        state.entities,
        'checked',
        id,
        value,
        false,
      ),
    }),
  ),
  on(Actions.resetObjective, (state, { id }) =>
    spread(state, {
      entities: StoreUtility.resetFields(
        state.entities,
        ['machineId', 'overclock', 'modules', 'beacons'],
        id,
      ),
    }),
  ),
  on(Actions.adjustDisplayRate, (state, { factor }) => {
    const entities = { ...state.entities };
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
  on(Recipes.resetMachines, (state) =>
    spread(state, {
      entities: StoreUtility.resetFields(state.entities, [
        'machineId',
        'overclock',
        'modules',
        'beacons',
      ]),
    }),
  ),
  on(Recipes.resetBeacons, (state) =>
    spread(state, {
      entities: StoreUtility.resetField(state.entities, 'beacons'),
    }),
  ),
  on(Items.resetChecked, (state) =>
    spread(state, {
      entities: StoreUtility.resetField(state.entities, 'checked'),
    }),
  ),
);
