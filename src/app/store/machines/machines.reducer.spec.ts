import { ItemId, Mocks } from 'src/tests';
import { rational } from '~/models';
import * as App from '../app.actions';
import * as Actions from './machines.actions';
import { initialMachinesState, machinesReducer } from './machines.reducer';

describe('Machines Reducer', () => {
  const id = 'id';
  const value = 'value';
  const def = 'default';

  describe('LOAD', () => {
    it('should load machine settings', () => {
      const result = machinesReducer(
        undefined,
        new App.LoadAction({
          machinesState: Mocks.MachinesStateInitial,
        } as any),
      );
      expect(result).toEqual(Mocks.MachinesStateInitial);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = machinesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialMachinesState);
    });
  });

  describe('SET_FUEL_RANK', () => {
    it('should set the default fuel rank', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetFuelRankAction({ value: [value], def: [def] }),
      );
      expect(result.fuelRankIds).toEqual([value]);
    });
  });

  describe('SET_MODULE_RANK', () => {
    it('should set the default module rank', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetModuleRankAction({ value: [value], def: [def] }),
      );
      expect(result.moduleRankIds).toEqual([value]);
    });
  });

  describe('SET_DEFAULT_BEACONS', () => {
    it('should set the default beacons', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetDefaultBeaconsAction([]),
      );
      expect(result.beacons).toEqual([]);
    });
  });

  describe('SET_DEFAULT_OVERCLOCK', () => {
    it('should set the default overclock', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetDefaultOverclockAction(rational(100n)),
      );
      expect(result.overclock).toEqual(rational(100n));
    });
  });

  describe('ADD', () => {
    it('should add a machine to the list', () => {
      const result = machinesReducer(
        { ids: [], entities: {} },
        new Actions.AddAction({ value, def: [def] }),
      );
      expect(result.ids).toEqual([value]);
    });

    it('should handle undefined ids', () => {
      const result = machinesReducer(
        undefined,
        new Actions.AddAction({ value, def: [def] }),
      );
      expect(result.ids).toEqual([def, value]);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesReducer(
        undefined,
        new Actions.AddAction({ value, def: undefined }),
      );
      expect(result.ids).toEqual([value]);
    });
  });

  describe('REMOVE', () => {
    it('should remove a machine from the list', () => {
      const result = machinesReducer(
        { ids: [], entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: [def] }),
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });

    it('should handle undefined ids', () => {
      const result = machinesReducer(
        { ids: undefined, entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: [def] }),
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });

    it('should handle undefined ids and default', () => {
      const result = machinesReducer(
        { ids: undefined, entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: undefined }),
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });
  });

  describe('SET_RANK', () => {
    it('should set the order of ids', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetRankAction({ value: [value], def: undefined }),
      );
      expect(result.ids).toEqual([value]);
    });
  });

  describe('SET_MACHINE', () => {
    it('should replace an id in the rank list', () => {
      const result = machinesReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id: def, value, def: [def] }),
      );
      expect(result.ids).toEqual([value]);
      expect(result.entities[value]).toBeUndefined();
    });

    it('should do nothing if id is not found', () => {
      const result = machinesReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: [def] }),
      );
      expect(result.ids).toBeUndefined();
      expect(result.entities[def]).toEqual('test' as any);
    });

    it('should handle no match in ids', () => {
      const result = machinesReducer(
        { ids: [], entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: [def] }),
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[def]).toEqual('test' as any);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: undefined }),
      );
      expect(result.ids).toBeUndefined();
      expect(result.entities[def]).toEqual('test' as any);
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel for a machine', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetFuelAction({ id, value, def: undefined }),
      );
      expect(result.entities[id].fuelId).toEqual(value);
    });
  });

  describe('SET_MODULES', () => {
    it('should set the modules for a machine', () => {
      const value = [{ count: rational(2n), id: ItemId.Module }];
      const result = machinesReducer(
        undefined,
        new Actions.SetModulesAction({
          id,
          value,
        }),
      );
      expect(result.entities[id].modules).toEqual(value);
    });
  });

  describe('SET_BEACONS', () => {
    it('should set the beacons for a machine', () => {
      const value = [
        {
          count: rational(0n),
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.Module }],
        },
      ];
      const result = machinesReducer(
        undefined,
        new Actions.SetBeaconsAction({
          id,
          value,
        }),
      );
      expect(result.entities[id].beacons).toEqual(value);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock for a machine', () => {
      const result = machinesReducer(
        undefined,
        new Actions.SetOverclockAction({
          id,
          value: rational(200n),
          def: rational(100n),
        }),
      );
      expect(result.entities[id].overclock).toEqual(rational(200n));
    });
  });

  describe('RESET_MACHINE', () => {
    it('should reset a machine', () => {
      const result = machinesReducer(
        Mocks.MachinesStateInitial,
        new Actions.ResetMachineAction(ItemId.AssemblingMachine2),
      );
      expect(result.entities[ItemId.AssemblingMachine2]).toBeUndefined();
    });
  });

  it('should return the default state', () => {
    expect(machinesReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialMachinesState,
    );
  });
});
