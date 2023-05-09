import { ItemId, Mocks } from 'src/tests';
import { ItemObjective, ObjectiveType, RateUnit } from '~/models';
import * as App from '../app.actions';
import * as Actions from './item-objectives.actions';
import {
  initialItemObjectivesState,
  itemObjectivesReducer,
  ItemObjectivesState,
} from './item-objectives.reducer';

describe('Item Objectives Reducer', () => {
  const state = itemObjectivesReducer(
    undefined,
    new Actions.AddAction(ItemId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of item objectives', () => {
      const itemObjectivesState: ItemObjectivesState = {
        ids: ['id'],
        entities: { id: Mocks.ItemObjective1 },
        index: 1,
      };
      const result = itemObjectivesReducer(
        undefined,
        new App.LoadAction({ itemObjectivesState })
      );
      expect(result).toEqual(itemObjectivesState);
    });

    it('should skip loading state if null', () => {
      const result = itemObjectivesReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialItemObjectivesState);
    });
  });

  describe('App RESET', () => {
    it('should return the initial state', () => {
      const result = itemObjectivesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialItemObjectivesState);
    });
  });

  describe('ADD', () => {
    it('should add a new objective', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use settings from the last added objective', () => {
      const state: ItemObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.Coal,
            rate: '30',
            rateUnit: RateUnit.Wagons,
            type: ObjectiveType.Output,
          },
        },
        index: 1,
      };
      const result = itemObjectivesReducer(
        state,
        new Actions.AddAction(ItemId.Wood)
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        itemId: ItemId.Wood,
        rate: '30',
        rateUnit: RateUnit.Wagons,
        type: ObjectiveType.Output,
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new objective', () => {
      const itemObjective: ItemObjective = {
        id: '1',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateUnit: RateUnit.Items,
        type: ObjectiveType.Output,
      };
      const result = itemObjectivesReducer(
        state,
        new Actions.CreateAction(itemObjective)
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        itemId: ItemId.IronPlate,
        rate: '2',
        rateUnit: RateUnit.Items,
        type: ObjectiveType.Output,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove an objective', () => {
      const result = itemObjectivesReducer(
        state,
        new Actions.RemoveAction('0')
      );
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_ITEM', () => {
    it('should set item on an objective', () => {
      const result = itemObjectivesReducer(
        state,
        new Actions.SetItemAction({
          id: Mocks.ItemObjective1.id,
          value: ItemId.Coal,
        })
      );
      expect(result.entities[Mocks.ItemObjective1.id].itemId).toEqual(
        ItemId.Coal
      );
    });
  });

  describe('SET_RATE', () => {
    it('should set rate of an objective', () => {
      const value = '3';
      const result = itemObjectivesReducer(
        state,
        new Actions.SetRateAction({ id: Mocks.ItemObjective1.id, value })
      );
      expect(result.entities[Mocks.ItemObjective1.id].rate).toEqual(value);
    });
  });

  describe('SET_RATE_UNIT', () => {
    it('should set rate unit of an objective', () => {
      const value = RateUnit.Wagons;
      const result = itemObjectivesReducer(
        state,
        new Actions.SetRateUnitAction({ id: Mocks.ItemObjective1.id, value })
      );
      expect(result.entities[Mocks.ItemObjective1.id].rateUnit).toEqual(value);
    });
  });

  describe('SET_TYPE', () => {
    it('should set type of an objective', () => {
      const value = ObjectiveType.Limit;
      const result = itemObjectivesReducer(
        state,
        new Actions.SetTypeAction({ id: Mocks.ItemObjective1.id, value })
      );
      expect(result.entities[Mocks.ItemObjective1.id].type).toEqual(value);
    });
  });

  describe('ADJUST_DISPLAY_RATE', () => {
    it('should adjust rates for objectives when display rate changes', () => {
      const result = itemObjectivesReducer(
        state,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.ItemObjective1.id].rate).toEqual('1/60');
    });

    it('should not adjust rates when rate type unaffected by display rate', () => {
      let result = itemObjectivesReducer(
        state,
        new Actions.SetRateUnitAction({ id: '0', value: RateUnit.Belts })
      );
      result = itemObjectivesReducer(
        result,
        new Actions.AdjustDisplayRateAction('1/60')
      );
      expect(result.entities[Mocks.ItemObjective1.id].rate).toEqual('1');
    });
  });

  it('should return default state', () => {
    expect(itemObjectivesReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
