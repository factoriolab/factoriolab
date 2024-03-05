import { ItemId, Mocks, RecipeId } from 'src/tests';
import { Objective, ObjectiveType, ObjectiveUnit } from '~/models';
import { Items } from '../';
import * as App from '../app.actions';
import * as Recipes from '../recipes';
import * as Actions from './objectives.actions';
import {
  initialObjectivesState,
  objectivesReducer,
  ObjectivesState,
} from './objectives.reducer';

describe('Objectives Reducer', () => {
  const state = objectivesReducer(
    undefined,
    new Actions.AddAction({ targetId: ItemId.Coal, unit: ObjectiveUnit.Items }),
  );

  describe('LOAD', () => {
    it('should load a list of objectives', () => {
      const objectivesState: ObjectivesState = {
        ids: ['0'],
        entities: { id: Mocks.Objective5 },
        index: 1,
      };
      const result = objectivesReducer(
        undefined,
        new App.LoadAction({ objectivesState }),
      );
      expect(result).toEqual(objectivesState);
    });

    it('should skip loading objectives state if null', () => {
      const result = objectivesReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialObjectivesState);
    });
  });

  describe('App RESET', () => {
    it('should reset the reducer', () => {
      const result = objectivesReducer(undefined, new App.ResetAction());
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
        new Actions.SetValueAction({ id: '0', value: '60' }),
      );
      result = objectivesReducer(
        result,
        new Actions.AddAction({
          targetId: ItemId.Coal,
          unit: ObjectiveUnit.Items,
        }),
      );
      expect(result.entities['1'].value).toEqual('60');
    });
  });

  describe('CREATE', () => {
    it('should create a new objective', () => {
      const objective: Objective = {
        id: '1',
        targetId: RecipeId.IronPlate,
        value: '2',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const result = objectivesReducer(
        state,
        new Actions.CreateAction(objective),
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.IronPlate,
        value: '2',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove an objective', () => {
      const result = objectivesReducer(state, new Actions.RemoveAction('0'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ORDER', () => {
    it('should set the order of objectives', () => {
      const result = objectivesReducer(
        undefined,
        new Actions.SetOrderAction(['1', '0']),
      );
      expect(result.ids).toEqual(['1', '0']);
    });
  });

  describe('SET_TARGET', () => {
    it('should set recipe on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetTargetAction({ id: '0', value: RecipeId.Coal }),
      );
      expect(result.entities['0'].targetId).toEqual(RecipeId.Coal);
    });
  });

  describe('SET_VALUE', () => {
    it('should set value of an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetValueAction({ id: '0', value: '30' }),
      );
      expect(result.entities['0'].value).toEqual('30');
    });
  });

  describe('SET_UNIT', () => {
    it('should set target and unit of an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetUnitAction({
          id: '0',
          value: {
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
      const result = objectivesReducer(
        state,
        new Actions.SetTypeAction({ id: '0', value }),
      );
      expect(result.entities['0'].type).toEqual(value);
    });
  });

  describe('SET_MACHINE', () => {
    it('should set machine on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetMachineAction({
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
        new Actions.SetFuelAction({
          id: '0',
          value: ItemId.Coal,
          def: undefined,
        }),
      );
      expect(result.entities['0'].fuelId).toEqual(ItemId.Coal);
    });
  });

  describe('SET_MACHINE_MODULES', () => {
    it('should set machine modules on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetMachineModulesAction({
          id: '0',
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        }),
      );
      expect(result.entities['0'].machineModuleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('ADD_BEACON', () => {
    it('should add a beacon to an objective', () => {
      const result = objectivesReducer(state, new Actions.AddBeaconAction('0'));
      expect(result.entities['0'].beacons?.length).toEqual(2);
    });
  });

  describe('REMOVE_BEACON', () => {
    it('should remove a beacon from an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.RemoveBeaconAction({ id: '0', value: 0 }),
      );
      expect(result.entities['0'].beacons?.length).toEqual(0);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set beacon count on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetBeaconCountAction({
          id: '0',
          index: 0,
          value: '8',
          def: '0',
        }),
      );
      expect(result.entities['0'].beacons?.[0].count).toEqual('8');
    });
  });

  describe('SET_BEACON', () => {
    it('should set beacon on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetBeaconAction({
          id: '0',
          index: 0,
          value: ItemId.Beacon,
          def: ItemId.AssemblingMachine1,
        }),
      );
      expect(result.entities['0'].beacons?.[0].id).toEqual(ItemId.Beacon);
    });
  });

  describe('SET_BEACON_MODULES', () => {
    it('should set beacon modules on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetBeaconModulesAction({
          id: '0',
          index: 0,
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        }),
      );
      expect(result.entities['0'].beacons?.[0].moduleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('SET_BEACON_TOTAL', () => {
    it('should set the beacon total', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetBeaconTotalAction({
          id: '0',
          index: 0,
          value: '200',
        }),
      );
      expect(result.entities['0'].beacons?.[0].total).toEqual('200');
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set overclock on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetOverclockAction({
          id: '0',
          value: 200,
          def: 100,
        }),
      );
      expect(result.entities['0'].overclock).toEqual(200);
    });
  });

  describe('SET_CHECKED', () => {
    it('should set checked state on an objective', () => {
      const result = objectivesReducer(
        state,
        new Actions.SetCheckedAction({
          id: '0',
          value: true,
        }),
      );
      expect(result.entities['0'].checked).toBeTrue();
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
            value: '30',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(
        state,
        new Actions.ResetObjectiveAction('0'),
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: '30',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for objectives when display rate changes', () => {
      const result = objectivesReducer(
        state,
        new Actions.AdjustDisplayRateAction('1/60'),
      );
      expect(result.entities[Mocks.Objective1.id].value).toEqual('1/60');
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = objectivesReducer(
        state,
        new Actions.SetUnitAction({
          id: '0',
          value: {
            targetId: ItemId.Coal,
            unit: ObjectiveUnit.Belts,
          },
        }),
      );
      result = objectivesReducer(
        result,
        new Actions.AdjustDisplayRateAction('1/60'),
      );
      expect(result.entities['0'].value).toEqual('1');
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
            value: '30',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(
        state,
        new Recipes.ResetMachinesAction(),
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: '30',
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
            value: '30',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = objectivesReducer(state, new Recipes.ResetBeaconsAction());
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: '30',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
        machineId: 'machineId',
        overclock: 100,
      });
    });
  });

  describe('Items RESET_CHECKED', () => {
    it('should reset checked on all objectives', () => {
      const state: ObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            targetId: RecipeId.WoodenChest,
            value: '30',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            checked: true,
          },
        },
        index: 1,
      };
      const result = objectivesReducer(state, new Items.ResetCheckedAction());
      expect(result.entities['0']).toEqual({
        id: '0',
        targetId: RecipeId.WoodenChest,
        value: '30',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      });
    });
  });

  it('should return default state', () => {
    expect(objectivesReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
