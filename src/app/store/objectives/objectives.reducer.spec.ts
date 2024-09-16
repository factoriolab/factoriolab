import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { ItemId, Mocks, RecipeId } from '~/tests';

import { load, reset } from '../app.actions';
import { resetBeacons, resetMachines } from '../recipes/recipes.actions';
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
import {
  initialObjectivesState,
  objectivesReducer,
  ObjectivesState,
} from './objectives.reducer';

describe('Objectives Reducer', () => {
  const state = objectivesReducer(
    undefined,
    add({
      objective: { targetId: ItemId.Coal, unit: ObjectiveUnit.Items },
    }),
  );

  describe('LOAD', () => {
    it('should load a list of objectives', () => {
      const objectivesState: ObjectivesState = {
        ids: ['0'],
        entities: { id: Mocks.objective5 },
        index: 1,
      };
      const result = objectivesReducer(
        undefined,
        load({ partial: { objectivesState } }),
      );
      expect(result).toEqual(objectivesState);
    });

    it('should skip loading objectives state if null', () => {
      const result = objectivesReducer(undefined, load({ partial: {} }));
      expect(result).toEqual(initialObjectivesState);
    });
  });

  describe('App RESET', () => {
    it('should reset the reducer', () => {
      const result = objectivesReducer(undefined, reset());
      expect(result).toEqual(initialObjectivesState);
    });
  });

  describe('ADD', () => {
    it('should add a new objective', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use the value of the last objective', () => {
      let result = objectivesReducer(
        state,
        setValue({ id: '0', value: rational(60n) }),
      );
      result = objectivesReducer(
        result,
        add({
          objective: {
            targetId: ItemId.Coal,
            unit: ObjectiveUnit.Items,
          },
        }),
      );
      expect(result.entities['1'].value).toEqual(rational(60n));
    });
  });

  describe('CREATE', () => {
    it('should create a new objective', () => {
      const objective: Objective = {
        id: '1',
        targetId: RecipeId.IronPlate,
        value: rational(2n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const result = objectivesReducer(state, create({ objective }));
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.IronPlate,
        value: rational(2n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove an objective', () => {
      const result = objectivesReducer(state, remove({ id: '0' }));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ORDER', () => {
    it('should set the order of objectives', () => {
      const result = objectivesReducer(
        undefined,
        setOrder({ ids: ['1', '0'] }),
      );
      expect(result.ids).toEqual(['1', '0']);
    });
  });

  describe('SET_TARGET', () => {
    it('should set recipe on an objective', () => {
      const result = objectivesReducer(
        state,
        setTarget({ id: '0', value: RecipeId.Coal }),
      );
      expect(result.entities['0'].targetId).toEqual(RecipeId.Coal);
    });
  });

  describe('SET_VALUE', () => {
    it('should set value of an objective', () => {
      const result = objectivesReducer(
        state,
        setValue({ id: '0', value: rational(30n) }),
      );
      expect(result.entities['0'].value).toEqual(rational(30n));
    });
  });

  describe('SET_UNIT', () => {
    it('should set target and unit of an objective', () => {
      const result = objectivesReducer(
        state,
        setUnit({
          id: '0',
          objective: {
            targetId: ItemId.AdvancedCircuit,
            unit: ObjectiveUnit.Belts,
          },
        }),
      );
      expect(result.entities['0'].targetId).toEqual(ItemId.AdvancedCircuit);
      expect(result.entities['0'].unit).toEqual(ObjectiveUnit.Belts);
    });
  });

  describe('SET_TYPE', () => {
    it('should set type of an objective', () => {
      const value = ObjectiveType.Limit;
      const result = objectivesReducer(state, setType({ id: '0', value }));
      expect(result.entities['0'].type).toEqual(value);
    });
  });

  describe('SET_MACHINE', () => {
    it('should set machine on an objective', () => {
      const result = objectivesReducer(
        state,
        setMachine({
          id: '0',
          value: ItemId.AssemblingMachine2,
          def: ItemId.AssemblingMachine1,
        }),
      );
      expect(result.entities['0'].machineId).toEqual(ItemId.AssemblingMachine2);
    });
  });

  describe('SET_FUEL', () => {
    it('should set machine fuel on an objective', () => {
      const result = objectivesReducer(
        state,
        setFuel({
          id: '0',
          value: ItemId.Coal,
          def: undefined,
        }),
      );
      expect(result.entities['0'].fuelId).toEqual(ItemId.Coal);
    });
  });

  describe('SET_MODULES', () => {
    it('should set modules on an objective', () => {
      const value = [{ count: rational.one, id: ItemId.SpeedModule }];
      const result = objectivesReducer(
        state,
        setModules({
          id: '0',
          value,
        }),
      );
      expect(result.entities['0'].modules).toEqual(value);
    });
  });

  describe('SET_BEACONS', () => {
    it('should set beacons on an objective', () => {
      const value = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.Module }],
        },
      ];
      const result = objectivesReducer(
        state,
        setBeacons({
          id: '0',
          value,
        }),
      );
      expect(result.entities['0'].beacons).toEqual(value);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set overclock on an objective', () => {
      const result = objectivesReducer(
        state,
        setOverclock({
          id: '0',
          value: rational(200n),
          def: rational(100n),
        }),
      );
      expect(result.entities['0'].overclock).toEqual(rational(200n));
    });
  });

  describe('RESET_OBJECTIVE', () => {
    it('should reset an objective', () => {
      const state: ObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            targetId: RecipeId.WoodenChest,
            value: rational(30n),
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: rational(100n),
            beacons: [
              {
                count: rational(8n),
                id: 'beaconId',
                modules: [{ count: rational(2n), id: ItemId.Module }],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(state, resetObjective({ id: '0' }));
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: rational(30n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for objectives when display rate changes', () => {
      const result = objectivesReducer(
        state,
        adjustDisplayRate({ factor: rational(1n, 60n) }),
      );
      expect(result.entities[Mocks.objective1.id].value).toEqual(
        rational(1n, 60n),
      );
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = objectivesReducer(
        state,
        setUnit({
          id: '0',
          objective: {
            targetId: ItemId.Coal,
            unit: ObjectiveUnit.Belts,
          },
        }),
      );
      result = objectivesReducer(
        result,
        adjustDisplayRate({ factor: rational(1n, 60n) }),
      );
      expect(result.entities['0'].value).toEqual(rational.one);
    });
  });

  describe('Recipes RESET_MACHINES', () => {
    it('should reset all objectives', () => {
      const state: ObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            targetId: RecipeId.WoodenChest,
            value: rational(30n),
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: rational(100n),
            beacons: [
              {
                count: rational(8n),
                id: 'beaconId',
                modules: [{ count: rational(2n), id: ItemId.Module }],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(state, resetMachines());
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: rational(30n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });

  describe('Recipes RESET_BEACONS', () => {
    it('should reset beacons on all objectives', () => {
      const state: ObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            targetId: RecipeId.WoodenChest,
            value: rational(30n),
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: rational(100n),
            beacons: [
              {
                count: rational(8n),
                id: 'beaconId',
                modules: [{ count: rational(2n), id: ItemId.Module }],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(state, resetBeacons());
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: rational(30n),
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        machineId: 'machineId',
        overclock: rational(100n),
      });
    });
  });

  it('should return default state', () => {
    expect(objectivesReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
