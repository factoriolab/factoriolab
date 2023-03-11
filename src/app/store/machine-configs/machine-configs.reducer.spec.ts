import { ItemId, Mocks } from 'src/tests';
import * as App from '../app.actions';
import * as Actions from './machine-configs.actions';
import {
  initialMachinesCfgState,
  machinesCfgReducer,
} from './machine-configs.reducer';

describe('Machines Reducer', () => {
  const id = 'id';
  const value = 'value';
  const def = 'default';

  describe('LOAD', () => {
    it('should load machine settings', () => {
      const result = machinesCfgReducer(
        undefined,
        new App.LoadAction({
          machinesState: Mocks.MachineSettingsInitial,
        } as any)
      );
      expect(result).toEqual(Mocks.MachineSettingsInitial);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = machinesCfgReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialMachinesCfgState);
    });
  });

  describe('ADD', () => {
    it('should add a machine to the list', () => {
      const result = machinesCfgReducer(
        { ids: [], entities: {} },
        new Actions.AddAction({ value, def: [def] })
      );
      expect(result.ids).toEqual([value]);
    });

    it('should handle undefined ids', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.AddAction({ value, def: [def] })
      );
      expect(result.ids).toEqual([def, value]);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.AddAction({ value, def: undefined })
      );
      expect(result.ids).toEqual([value]);
    });
  });

  describe('REMOVE', () => {
    it('should remove a machine from the list', () => {
      const result = machinesCfgReducer(
        { ids: [], entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: [def] })
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });

    it('should handle undefined ids', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: [def] })
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });

    it('should handle undefined ids and default', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: { [def]: {} } } as any,
        new Actions.RemoveAction({ value: def, def: undefined })
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[value]).toBeUndefined();
    });
  });

  describe('RAISE', () => {
    it('should raise the rank of a machine', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.RaiseAction({ value: def, def: [value, def] })
      );
      expect(result.ids).toEqual([def, value]);
    });

    it('should do nothing if rank is already highest', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.RaiseAction({ value, def: [value, def] })
      );
      expect(result.ids).toBeUndefined();
    });

    it('should handle no match in ids', () => {
      const result = machinesCfgReducer(
        { ids: [], entities: {} },
        new Actions.RaiseAction({ value: def, def: [value, def] })
      );
      expect(result.ids).toEqual([]);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.RaiseAction({ value: def, def: undefined })
      );
      expect(result.ids).toBeUndefined();
    });
  });

  describe('LOWER', () => {
    it('should lower the rank of a machine', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.LowerAction({ value, def: [value, def] })
      );
      expect(result.ids).toEqual([def, value]);
    });

    it('should do nothing if rank is already lowest', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.LowerAction({ value: def, def: [value, def] })
      );
      expect(result.ids).toBeUndefined();
    });

    it('should handle no match in ids', () => {
      const result = machinesCfgReducer(
        { ids: [], entities: {} },
        new Actions.LowerAction({ value: def, def: [value, def] })
      );
      expect(result.ids).toEqual([]);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: {} },
        new Actions.LowerAction({ value: def, def: undefined })
      );
      expect(result.ids).toBeUndefined();
    });
  });

  describe('SET_MACHINE', () => {
    it('should replace an id in the rank list', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id: def, value, def: [def] })
      );
      expect(result.ids).toEqual([value]);
      expect(result.entities[value]).toEqual('test' as any);
    });

    it('should do nothing if id is not found', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: [def] })
      );
      expect(result.ids).toBeUndefined();
      expect(result.entities[def]).toEqual('test' as any);
    });

    it('should handle no match in ids', () => {
      const result = machinesCfgReducer(
        { ids: [], entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: [def] })
      );
      expect(result.ids).toEqual([]);
      expect(result.entities[def]).toEqual('test' as any);
    });

    it('should handle undefined ids and default', () => {
      const result = machinesCfgReducer(
        { ids: undefined, entities: { [def]: 'test' } } as any,
        new Actions.SetMachineAction({ id, value, def: undefined })
      );
      expect(result.ids).toBeUndefined();
      expect(result.entities[def]).toEqual('test' as any);
    });
  });

  describe('SET_MODULE_RANK', () => {
    it('should set the module rank for a machine', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.SetModuleRankAction({ id, value: [value], def: [] })
      );
      expect(result.entities[id].moduleRankIds).toEqual([value]);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the beacon count for a machine', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.SetBeaconCountAction({ id, value: '2', def: '8' })
      );
      expect(result.entities[id].beaconCount).toEqual('2');
    });
  });

  describe('SET_BEACON', () => {
    it('should set the beacon for a machine', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.SetBeaconAction({ id, value, def: ItemId.Beacon })
      );
      expect(result.entities[id].beaconId).toEqual(value);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the beacon module for a machine', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.SetBeaconModuleRankAction({
          id,
          value: [value],
          def: [],
        })
      );
      expect(result.entities[id].beaconModuleRankIds).toEqual([value]);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock for a machine', () => {
      const result = machinesCfgReducer(
        undefined,
        new Actions.SetOverclockAction({ id, value: 200, def: 100 })
      );
      expect(result.entities[id].overclock).toEqual(200);
    });
  });

  it('should return the default state', () => {
    expect(machinesCfgReducer(undefined, { type: 'Test' } as any)).toEqual(
      initialMachinesCfgState
    );
  });
});
