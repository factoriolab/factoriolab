import { ItemId, Mocks } from 'src/tests';

import { Entities } from '~/models';

import { StoreUtility } from './store.utility';

describe('StoreUtility', () => {
  describe('rankEquals', () => {
    it('should check lengths', () => {
      expect(StoreUtility.rankEquals(['a'], ['a', 'b'])).toBeFalse();
    });

    it('should honor order', () => {
      expect(StoreUtility.rankEquals(['a', 'b'], ['b', 'a'])).toBeFalse();
    });

    it('should check equal ranks', () => {
      expect(StoreUtility.rankEquals(['a', 'b'], ['a', 'b'])).toBeTrue();
    });

    it('should handle null comparison value', () => {
      expect(StoreUtility.rankEquals(['a'], undefined)).toBeFalse();
    });
  });

  describe('resetFields', () => {
    it('should reset multiple fields', () => {
      const result = StoreUtility.resetFields(
        {
          [Mocks.Item1.id]: {
            excluded: true,
            belt: ItemId.TransportBelt,
            machine: ItemId.AssemblingMachine1,
          },
        },
        ['excluded', 'belt'],
      );
      expect(result[Mocks.Item1.id]).toEqual({
        machine: ItemId.AssemblingMachine1,
      } as any);
    });
  });

  describe('resetField', () => {
    it('should reset changes to a field', () => {
      const result = StoreUtility.resetField(
        { [Mocks.Item1.id]: { excluded: true, belt: ItemId.TransportBelt } },
        'excluded',
      );
      expect(result[Mocks.Item1.id]).toEqual({
        belt: ItemId.TransportBelt,
      } as any);
    });

    it('should delete an entity if no modifications remain', () => {
      const result = StoreUtility.resetField(
        { [Mocks.Item1.id]: { excluded: true } },
        'excluded',
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });

    it('should reset a field for a specific id', () => {
      const result = StoreUtility.resetField(
        { [Mocks.Item1.id]: { excluded: true, belt: ItemId.TransportBelt } },
        'excluded',
        Mocks.Item1.id,
      );
      expect(result[Mocks.Item1.id]).toEqual({
        belt: ItemId.TransportBelt,
      } as any);
    });
  });

  describe('compareReset', () => {
    const id = 'id';
    const field = 'test';

    it('should set field when not equal to default', () => {
      const result = StoreUtility.compareReset(
        { [id]: { [field]: '' } },
        field,
        id,
        'a',
        'b',
      );
      expect(result[id][field]).toEqual('a');
    });

    it('should do nothing if null and equal to default', () => {
      const result = StoreUtility.compareReset(
        { [id]: { [field]: '' } },
        field,
        id,
        'a',
        'a',
      );
      expect(result).toEqual({});
    });

    it('should delete field when equal to default', () => {
      const result = StoreUtility.compareReset(
        { [id]: { other: 'b', [field]: 'b' } },
        field,
        id,
        'a',
        'a',
      );
      expect(result[id][field]).toBeUndefined();
    });

    it('should delete entry when equal to default and no other entries', () => {
      const result = StoreUtility.compareReset(
        { [id]: { [field]: 'value' } },
        field,
        id,
        'a',
        'a',
      );
      expect(result).toEqual({} as any);
    });
  });

  describe('setValue', () => {
    it('should clean up object if setting to undefined', () => {
      const entities: Entities<{ value?: string }> = { id: { value: 'value' } };
      expect(StoreUtility.setValue(entities, 'value', 'id', undefined)).toEqual(
        {},
      );
    });
  });

  describe('compareValue', () => {
    it('should return null if equal to default', () => {
      expect(StoreUtility.compareValue('a', 'a')).toBeUndefined();
    });

    it('should return value if not equal to default', () => {
      expect(StoreUtility.compareValue('a', 'b')).toEqual('a');
    });
  });

  describe('compareSet', () => {
    it('should return value if size does not match', () => {
      expect(StoreUtility.compareSet(new Set([1]), new Set())).toEqual(
        new Set([1]),
      );
    });

    it('should return undefined if equal to default', () => {
      expect(
        StoreUtility.compareSet(new Set([1]), new Set([1])),
      ).toBeUndefined();
    });

    it('should return value if not equal to default', () => {
      expect(StoreUtility.compareSet(new Set([1]), new Set([2]))).toEqual(
        new Set([1]),
      );
    });
  });

  describe('compareRank', () => {
    it('should return null if equal to default', () => {
      expect(StoreUtility.compareRank(['a', 'b'], ['a', 'b'])).toBeUndefined();
    });

    it('should return value if not equal to default', () => {
      expect(StoreUtility.compareRank(['a', 'b'], ['b', 'a'])).toEqual([
        'a',
        'b',
      ]);
    });
  });
});
