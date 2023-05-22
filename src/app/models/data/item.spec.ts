import { CategoryId, ItemId } from 'src/tests';
import { FuelType } from '../enum';
import { Rational } from '../rational';
import { RationalItem } from './item';

describe('RationalItem', () => {
  describe('constructor', () => {
    it('should fill in all fields', () => {
      const result = new RationalItem({
        id: ItemId.Wood,
        name: 'name',
        category: CategoryId.Combat,
        row: 1,
        stack: 2,
        belt: {
          speed: 1,
        },
        pipe: {
          speed: 10,
        },
        factory: {
          speed: 1,
          modules: 0,
        },
        module: {
          speed: 1,
          productivity: 1,
          consumption: 1,
        },
        fuel: {
          category: FuelType.Chemical,
          value: 2,
        },
        icon: 'icon',
        iconText: '2',
      });
      expect(result.id).toEqual(ItemId.Wood);
      expect(result.name).toEqual('name');
      expect(result.category).toEqual(CategoryId.Combat);
      expect(result.row).toEqual(1);
      expect(result.stack).toEqual(Rational.two);
      expect(result.belt?.speed).toEqual(Rational.one);
      expect(result.pipe?.speed).toEqual(Rational.ten);
      expect(result.factory?.speed).toEqual(Rational.one);
      expect(result.factory?.modules).toEqual(0);
      expect(result.module?.speed).toEqual(Rational.one);
      expect(result.module?.productivity).toEqual(Rational.one);
      expect(result.module?.consumption).toEqual(Rational.one);
      expect(result.fuel?.category).toEqual(FuelType.Chemical);
      expect(result.fuel?.value).toEqual(Rational.two);
      expect(result.icon).toEqual('icon');
      expect(result.iconText).toEqual('2');
    });

    it('should ignore undefined fields', () => {
      const result = new RationalItem({
        id: ItemId.Wood,
        name: 'name',
        category: CategoryId.Combat,
        row: 1,
      });
      expect(result.id).toEqual(ItemId.Wood);
      expect(result.name).toEqual('name');
      expect(result.category).toEqual(CategoryId.Combat);
      expect(result.row).toEqual(1);
      expect(result.stack).toBeUndefined();
      expect(result.belt).toBeUndefined();
      expect(result.pipe).toBeUndefined();
      expect(result.factory).toBeUndefined();
      expect(result.module).toBeUndefined();
      expect(result.fuel).toBeUndefined();
      expect(result.icon).toBeUndefined();
      expect(result.iconText).toBeUndefined();
    });
  });
});
