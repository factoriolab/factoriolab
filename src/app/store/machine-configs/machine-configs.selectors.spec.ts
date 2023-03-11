import { ItemId, Mocks } from 'src/tests';
import { Game } from '~/models';
import { initialMachinesCfgState } from './machine-configs.reducer';
import * as Selectors from './machine-configs.selectors';

describe('Machine Configs Selectors', () => {
  describe('getMachineSettings', () => {
    it('should fill in machine settings', () => {
      const result = Selectors.getMachinesCfg.projector(
        initialMachinesCfgState,
        Mocks.Defaults,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(3);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getMachinesCfg.projector(
        initialMachinesCfgState,
        null,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should read number of beacons', () => {
      const result = Selectors.getMachinesCfg.projector(
        {
          ids: undefined,
          entities: { [ItemId.AssemblingMachine2]: { beaconCount: '0' } },
        },
        null,
        Mocks.AdjustedData
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
      expect(result.entities[ItemId.AssemblingMachine2].beaconCount).toEqual(
        '0'
      );
    });

    it('should use null beaconCount for DSP', () => {
      const result = Selectors.getMachinesCfg.projector(
        initialMachinesCfgState,
        Mocks.Defaults,
        { ...Mocks.AdjustedData, ...{ game: Game.DysonSphereProgram } }
      );
      expect(result.entities[''].beaconCount).toBeUndefined();
    });

    it('should include overclock in Satisfactory', () => {
      const state = {
        ...initialMachinesCfgState,
        ...{
          entities: {
            ...initialMachinesCfgState.entities,
            ...{
              '': {
                ...initialMachinesCfgState.entities[''],
                ...{ overclock: 200 },
              },
            },
          },
        },
      };
      const result = Selectors.getMachinesCfg.projector(state, Mocks.Defaults, {
        ...Mocks.AdjustedData,
        ...{ game: Game.Satisfactory },
      });
      expect(result.entities[''].overclock).toEqual(200);
    });

    it('should default overclock to 100 in Satisfactory', () => {
      const state = {
        ...initialMachinesCfgState,
        ...{
          entities: {
            ...initialMachinesCfgState.entities,
            ...{
              '': {
                ...initialMachinesCfgState.entities[''],
                ...{ overclock: undefined },
              },
            },
          },
        },
      };
      const result = Selectors.getMachinesCfg.projector(state, Mocks.Defaults, {
        ...Mocks.AdjustedData,
        ...{ game: Game.Satisfactory },
      });
      expect(result.entities[''].overclock).toEqual(100);
    });
  });

  describe('getMachineOptions', () => {
    it('should handle null ids', () => {
      const result = Selectors.getMachineOptions.projector(
        initialMachinesCfgState,
        Mocks.Dataset
      );
      expect(result.length).toEqual(Mocks.Dataset.machineIds.length);
    });
  });

  describe('getMachineRows', () => {
    it('should handle null ids', () => {
      const result = Selectors.getMachineRows.projector(
        initialMachinesCfgState
      );
      expect(result).toEqual(['']);
    });

    it('should add empty option to beginning of list', () => {
      const result = Selectors.getMachineRows.projector({
        ids: [ItemId.AssemblingMachine1],
        entities: {},
      });
      expect(result).toEqual(['', ItemId.AssemblingMachine1]);
    });
  });
});
