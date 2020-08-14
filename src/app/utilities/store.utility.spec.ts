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

  describe('tryAddId', () => {
    it('should add to default if previously null', () => {
      expect(StoreUtility.tryAddId(null, { id: 'a', default: [] })).toEqual([
        'a',
      ]);
    });

    it('should return null if result is equal to default', () => {
      expect(StoreUtility.tryAddId([], { id: 'a', default: ['a'] })).toBeNull();
    });

    it('should return result if not equal to default', () => {
      expect(StoreUtility.tryAddId([], { id: 'a', default: [] })).toEqual([
        'a',
      ]);
    });
  });

  describe('tryRemoveId', () => {
    it('should remove from default if previously null', () => {
      expect(
        StoreUtility.tryRemoveId(null, { id: 'a', default: ['a'] })
      ).toEqual([]);
    });

    it('should return null if result is equal to default', () => {
      expect(
        StoreUtility.tryRemoveId(['a'], { id: 'a', default: [] })
      ).toBeNull();
    });

    it('should return result if not equal to default', () => {
      expect(
        StoreUtility.tryRemoveId(['a', 'b'], { id: 'b', default: [] })
      ).toEqual(['a']);
    });
  });
});
