import { createMap } from './maptype';
import { Rational } from './rational';
import { Variable } from './variable';

describe('IndexedMap', () => {
  describe('size', () => {
    it('should return the map array length', () => {
      const value = createMap<Variable, Rational>();
      expect(value.size()).toEqual(0);
      value.insert(new Variable(), Rational.one);
      expect(value.size()).toEqual(1);
    });
  });

  describe('empty', () => {
    it('should return whether the array is empty', () => {
      const value = createMap<Variable, Rational>();
      expect(value.empty()).toBeTrue();
      value.insert(new Variable(), Rational.one);
      expect(value.empty()).toBeFalse();
    });
  });

  describe('itemAt', () => {
    it('should return the item at an index', () => {
      const value = createMap<Variable, Rational>();
      value.insert(new Variable(), Rational.one);
      expect(value.itemAt(0)).toEqual(value.array[0]);
    });
  });

  describe('contains', () => {
    it('should determine whether the map contains the key', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      expect(value.contains(variable)).toBeFalse();
      value.insert(variable, Rational.one);
      expect(value.contains(variable)).toBeTrue();
    });
  });

  describe('find', () => {
    it('should find the item by key', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      expect(value.find(variable)).toBeUndefined();
      value.insert(variable, Rational.one);
      expect(value.find(variable)).toEqual(value.array[0]);
    });
  });

  describe('setDefault', () => {
    it('should create a new pair', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      const result = value.setDefault(variable, () => Rational.one);
      expect(result.first).toEqual(variable);
      expect(result.second).toEqual(Rational.one);
    });

    it('should return an existing pair', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.insert(variable, Rational.two);
      const result = value.setDefault(variable, () => Rational.one);
      expect(result.first).toEqual(variable);
      expect(result.second).toEqual(Rational.two);
    });
  });

  describe('insert', () => {
    it('should insert a new pair', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.insert(variable, Rational.one);
      expect(value.index[variable.id]).toEqual(0);
      expect(value.array[0].first).toEqual(variable);
      expect(value.array[0].second).toEqual(Rational.one);
    });

    it('should overwrite an existing pair', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.insert(variable, Rational.two);
      value.insert(variable, Rational.one);
      expect(value.index[variable.id]).toEqual(0);
      expect(value.array[0].first).toEqual(variable);
      expect(value.array[0].second).toEqual(Rational.one);
    });
  });

  describe('erase', () => {
    it('should ignore items whose key is not found', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.erase(variable);
      expect(value.empty()).toBeTrue();
    });

    it('should erase the last item in the list', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.insert(variable, Rational.one);
      const result = value.erase(variable);
      expect(value.empty()).toBeTrue();
      expect(result.first).toEqual(variable);
      expect(result.second).toEqual(Rational.one);
    });

    it('should erase an item in the middle of the list', () => {
      const value = createMap<Variable, Rational>();
      const variable1 = new Variable();
      const variable2 = new Variable();
      value.insert(variable1, Rational.one);
      value.insert(variable2, Rational.two);
      const result = value.erase(variable1);
      expect(value.empty()).toBeFalse();
      expect(result.first).toEqual(variable1);
      expect(result.second).toEqual(Rational.one);
      expect(value.index[variable2.id]).toEqual(0);
      expect(value.array[0].first).toEqual(variable2);
      expect(value.array[0].second).toEqual(Rational.two);
    });
  });

  describe('copy', () => {
    it('should copy an indexed map', () => {
      const value = createMap<Variable, Rational>();
      const variable = new Variable();
      value.insert(variable, Rational.one);
      const copy = value.copy();
      expect(copy).toEqual(value);
    });
  });
});
