import { Mocks, ItemId } from 'src/tests';
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
  });

  describe('arrayEquals', () => {
    it('should check lengths', () => {
      expect(StoreUtility.arrayEquals(['a'], ['a', 'b'])).toBeFalse();
    });

    it('should ignore order', () => {
      expect(StoreUtility.arrayEquals(['a', 'b'], ['b', 'a'])).toBeTrue();
    });

    it('should check equal arrays', () => {
      expect(StoreUtility.arrayEquals(['a', 'b'], ['a', 'b'])).toBeTrue();
    });
  });

  describe('payloadEquals', () => {
    it('should validate array payload equality', () => {
      expect(
        StoreUtility.payloadEquals({
          id: 'id',
          value: ['a', 'b'],
          default: ['a', 'b'],
        })
      ).toBeTrue();
      expect(
        StoreUtility.payloadEquals({
          id: 'id',
          value: ['a', 'b'],
          default: ['a', 'c'],
        })
      ).toBeFalse();
    });

    it('should validate value payload equality', () => {
      expect(
        StoreUtility.payloadEquals({
          id: 'id',
          value: 'a',
          default: 'a',
        })
      ).toBeTrue();
      expect(
        StoreUtility.payloadEquals({
          id: 'id',
          value: 'a',
          default: 'b',
        })
      ).toBeFalse();
    });
  });

  describe('resetFields', () => {
    it('should reset multiple fields', () => {
      const result = StoreUtility.resetFields(
        {
          [Mocks.Item1.id]: {
            ignore: true,
            belt: ItemId.TransportBelt,
            factory: ItemId.AssemblingMachine1,
          },
        },
        ['ignore', 'belt']
      );
      expect(result[Mocks.Item1.id]).toEqual({
        factory: ItemId.AssemblingMachine1,
      } as any);
    });
  });

  describe('resetField', () => {
    it('should reset changes to a field', () => {
      const result = StoreUtility.resetField(
        { [Mocks.Item1.id]: { ignore: true, belt: ItemId.TransportBelt } },
        'ignore'
      );
      expect(result[Mocks.Item1.id]).toEqual({
        belt: ItemId.TransportBelt,
      } as any);
    });

    it('should delete a recipe if no modifications remain', () => {
      const result = StoreUtility.resetField(
        { [Mocks.Item1.id]: { ignore: true } },
        'ignore'
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });

  describe('compareReset', () => {
    const id = 'id';
    const field = 'test';

    it('should set field when not equal to default', () => {
      const payload = { id, value: 'a', default: 'b' };
      const result = StoreUtility.compareReset({}, field, payload);
      expect(result[id][field]).toEqual('a');
    });

    it('should do nothing if null and equal to default', () => {
      const payload = { id, value: 'a', default: 'a' };
      const result = StoreUtility.compareReset({}, field, payload);
      expect(result).toEqual({});
    });

    it('should delete field when equal to default', () => {
      const payload = { id, value: 'a', default: 'a' };
      const result = StoreUtility.compareReset(
        { [id]: { other: 'b', [field]: 'b' } },
        field,
        payload
      );
      expect(result[id][field]).toBeUndefined();
    });

    it('should delete entry when equal to default and no other entries', () => {
      const payload = { id, value: 'a', default: 'a' };
      const result = StoreUtility.compareReset({ [id]: {} }, field, payload);
      expect(result).toEqual({} as any);
    });
  });

  describe('compareValue', () => {
    it('should return null if equal to default', () => {
      expect(
        StoreUtility.compareValue({ value: 'a', default: 'a' })
      ).toBeNull();
    });

    it('should return value if not equal to default', () => {
      expect(StoreUtility.compareValue({ value: 'a', default: 'b' })).toEqual(
        'a'
      );
    });
  });

  describe('compareValues', () => {
    it('should return null if equal to default', () => {
      expect(
        StoreUtility.compareValues({ value: ['a', 'b'], default: ['b', 'a'] })
      ).toBeNull();
    });

    it('should return value if not equal to default', () => {
      expect(
        StoreUtility.compareValues({ value: ['a'], default: ['b', 'a'] })
      ).toEqual(['a']);
    });
  });

  describe('compareRank', () => {
    it('should return null if equal to default', () => {
      expect(
        StoreUtility.compareRank({ value: ['a', 'b'], default: ['a', 'b'] })
      ).toBeNull();
    });

    it('should return value if not equal to default', () => {
      expect(
        StoreUtility.compareRank({ value: ['a', 'b'], default: ['b', 'a'] })
      ).toEqual(['a', 'b']);
    });
  });
});
