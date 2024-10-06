import { rational } from '~/models/rational';

import { EntityStore, Store } from './store';

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

class TestEntityStore extends EntityStore<{ field: string }> {}

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

describe('EntityStore', () => {
  let store: TestEntityStore;

  beforeEach(() => {
    store = new TestEntityStore();
  });

  describe('updateEntity', () => {
    it('should apply changes for a specific id', () => {
      store.updateEntity('id', { field: 'value' });
      expect(store.state()['id'].field).toEqual('value');
    });
  });

  describe('updateEntityField', () => {
    it('should update a specific field', () => {
      store.updateEntityField('id', 'field', 'value');
      expect(store.state()['id'].field).toEqual('value');
    });

    it('should update a specific field, checking a default value', () => {
      store.updateEntityField('id', 'field', 'value', 'value');
      expect(store.state()['id']).toBeUndefined();
    });
  });

  describe('resetFields', () => {
    it('should reset the passed fields', () => {
      store.updateEntityField('id', 'field', 'value');
      store.resetFields('field');
      expect(store.state()['id']).toBeUndefined();
    });
  });

  describe('resetId', () => {
    it('should reset the passed id', () => {
      store.updateEntityField('id', 'field', 'value');
      store.resetId('id');
      expect(store.state()['id']).toBeUndefined();
    });
  });
});
