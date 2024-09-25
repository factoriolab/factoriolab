import { Store } from './store';

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
});
