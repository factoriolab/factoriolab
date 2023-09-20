import { ItemId, Mocks } from 'src/tests';
import { Game } from '~/models';
import { initialMachinesState } from './machines.reducer';
import * as Selectors from './machines.selectors';

describe('Machines Selectors', () => {
  describe('getMachineSettings', () => {
    it('should fill in machine settings', () => {
      const result = Selectors.getMachinesState.projector(
        initialMachinesState,
        [ItemId.Coal],
        Mocks.Defaults,
        Mocks.Dataset,
      );
      expect(result.ids?.length).toEqual(3);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should handle null defaults', () => {
      const result = Selectors.getMachinesState.projector(
        initialMachinesState,
        [ItemId.Coal],
        null,
        Mocks.Dataset,
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
    });

    it('should read number of beacons', () => {
      const result = Selectors.getMachinesState.projector(
        {
          ids: undefined,
          entities: { [ItemId.AssemblingMachine2]: { beaconCount: '0' } },
        },
        [ItemId.Coal],
        null,
        Mocks.Dataset,
      );
      expect(result.ids?.length).toEqual(0);
      expect(Object.keys(result.entities).length).toEqual(19);
      expect(result.entities[ItemId.AssemblingMachine2].beaconCount).toEqual(
        '0',
      );
    });

    it('should use null beaconCount for DSP', () => {
      const result = Selectors.getMachinesState.projector(
        initialMachinesState,
        [ItemId.Coal],
        Mocks.Defaults,
        { ...Mocks.Dataset, ...{ game: Game.DysonSphereProgram } },
      );
      expect(result.entities[''].beaconCount).toBeUndefined();
    });

    it('should include overclock in Satisfactory', () => {
      const state = {
        ...initialMachinesState,
        ...{
          entities: {
            ...initialMachinesState.entities,
            ...{
              '': {
                ...initialMachinesState.entities[''],
                ...{ overclock: 200 },
              },
            },
          },
        },
      };
      const result = Selectors.getMachinesState.projector(
        state,
        [ItemId.Coal],
        Mocks.Defaults,
        {
          ...Mocks.Dataset,
          ...{ game: Game.Satisfactory },
        },
      );
      expect(result.entities[''].overclock).toEqual(200);
    });

    it('should default overclock to 100 in Satisfactory', () => {
      const state = {
        ...initialMachinesState,
        ...{
          entities: {
            ...initialMachinesState.entities,
            ...{
              '': {
                ...initialMachinesState.entities[''],
                ...{ overclock: undefined },
              },
            },
          },
        },
      };
      const result = Selectors.getMachinesState.projector(
        state,
        [ItemId.Coal],
        Mocks.Defaults,
        {
          ...Mocks.Dataset,
          ...{ game: Game.Satisfactory },
        },
      );
      expect(result.entities[''].overclock).toEqual(100);
    });
  });

  describe('getMachineOptions', () => {
    it('should handle null ids', () => {
      const result = Selectors.getMachineOptions.projector(
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(result.length).toEqual(Mocks.RawDataset.machineIds.length);
    });
  });
});
