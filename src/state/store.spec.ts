import { rational } from '~/rational/rational';

import { compareRank, compareSet, RecordStore, Store } from './store';

describe('compareRank', () => {
  it('should return undefined if rank matches', () => {
    expect(compareRank(['a', 'b', 'd'], ['a', 'b', 'c'])).toBeDefined();
    expect(compareRank(['a', 'b', 'c'], ['a', 'b', 'c'])).toBeUndefined();
  });
});

describe('compareSet', () => {
  it('should return undefined if set matches', () => {
    expect(compareSet(new Set([1, 2, 4]), new Set([1, 2, 3]))).toBeDefined();
    expect(compareSet(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBeUndefined();
  });
});

class TestStore extends Store<{
  field: string;
}> {
  constructor() {
    super({ field: 'init' });
  }
}

class TestNestedStore extends Store<{
  field: string;
  nested: { a: number; b: number };
}> {
  constructor() {
    super({ field: 'init', nested: { a: 1, b: 2 } }, ['nested']);
  }
}

class TestRecordStore extends RecordStore<{ field: string }> {}

describe('Store', () => {
  let store: TestStore;
  let nestedStore: TestNestedStore;

  beforeEach(() => {
    store = new TestStore();
    nestedStore = new TestNestedStore();
  });

  describe('load', () => {
    it('should set to the initial state if nullish', () => {
      nestedStore.load(undefined);
      expect(nestedStore.state().field).toEqual('init');
    });

    it('should handle partial nested objects', () => {
      nestedStore.load({ nested: { b: 3 } });
      expect(nestedStore.state().nested).toEqual({ a: 1, b: 3 });
    });

    it('should handle unset nested objects', () => {
      nestedStore.load({});
      expect(nestedStore.state().nested).toEqual({ a: 1, b: 2 });
    });
  });

  describe('apply', () => {
    it('should apply the partial state', () => {
      store.apply({ field: 'value' });
      expect(store.state().field).toEqual('value');
    });
  });

  describe('updateField', () => {
    it('should update a specific field, checking against a default value', () => {
      store.updateField('field', 'value', 'value');
      expect(store.state().field).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should create a partial and apply it to the state', () => {
      store['update'](() => ({ field: 'value' }));
      expect(store.state().field).toEqual('value');
    });
  });

  describe('select', () => {
    it('should create a computed signal for a specific field', () => {
      expect(store['select']('field')()).toEqual('init');
    });
  });

  describe('_resetValue', () => {
    it('should various data types', () => {
      const fn = store['_resetValue'];

      // Arrays
      expect(fn([1], [])).toEqual([1]);
      expect(fn([], [])).toBeUndefined();

      // Sets
      expect(fn(new Set([1]), new Set())).toEqual(new Set([1]));
      expect(fn(new Set(), new Set())).toBeUndefined();

      // Rationals
      expect(fn(rational.one, rational.zero)).toEqual(rational.one);
      expect(fn(rational.zero, rational.zero)).toBeUndefined();

      // Strings
      expect(fn('a', '')).toEqual('a');
      expect(fn('', '')).toBeUndefined();
    });
  });
});

describe('RecordStore', () => {
  let store: TestRecordStore;

  beforeEach(() => {
    store = new TestRecordStore();
  });

  describe('updateRecord', () => {
    it('should apply changes for a specific id', () => {
      store.updateRecord('id', { field: 'value' });
      expect(store.state()['id'].field).toEqual('value');
    });
  });

  describe('_resetField', () => {
    it('should reset a field and delete empty entities', () => {
      const result = store['_resetField']<{ field?: number; other?: number }>(
        {
          ['0']: { other: 1 },
          ['1']: { field: 1 },
          ['2']: { field: 2, other: 2 },
        },
        'field',
      );
      expect(result).toEqual({ ['0']: { other: 1 }, ['2']: { other: 2 } });
    });
  });

  describe('updateRecordField', () => {
    it('should update a specific field', () => {
      store.updateRecordField('id', 'field', 'value');
      expect(store.state()['id'].field).toEqual('value');
    });

    it('should update a specific field, checking a default value', () => {
      store.updateRecordField('id', 'field', 'value', 'value');
      expect(store.state()['id']).toBeUndefined();
    });
  });

  describe('removeRecordFields', () => {
    it('should reset the passed fields for the passed id', () => {
      store.updateRecordField('id', 'field', 'value');
      store.removeRecordFields('id', 'field');
      expect(store.state()['id']?.field).toBeUndefined();
    });
  });

  describe('resetFields', () => {
    it('should reset the passed fields', () => {
      store.updateRecordField('id', 'field', 'value');
      store.resetFields('field');
      expect(store.state()['id']).toBeUndefined();
    });
  });

  describe('resetId', () => {
    it('should reset the passed id', () => {
      store.updateRecordField('id', 'field', 'value');
      store.resetId('id');
      expect(store.state()['id']).toBeUndefined();
    });
  });
});
