import { TestBed } from '@angular/core/testing';

import { Game } from '~/models/enum/game';
import { Theme } from '~/models/enum/theme';
import { TestModule } from '~/tests';

import { PreferencesStore } from './preferences.store';

describe('PreferencesStore', () => {
  let store: PreferencesStore;

  beforeEach(() => {
    localStorage.setItem('preferences', '{"theme":"black"}');
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(PreferencesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should load from local storage', () => {
    expect(store.state().theme).toEqual(Theme.Black);
  });

  describe('saveState', () => {
    it('should save the state', () => {
      store.saveState(Game.Factorio, 'id', 'value');
      expect(store.state().states[Game.Factorio]['id']).toEqual('value');
    });
  });

  describe('removeState', () => {
    it('should remove the state', () => {
      store.saveState(Game.Factorio, 'id', 'value');
      store.removeState(Game.Factorio, 'id');
      expect(store.state().states[Game.Factorio]['id']).toBeUndefined();
    });
  });
});

describe('PreferencesService Error', () => {
  beforeEach(() => {
    localStorage.setItem('preferences', '{');
    spyOn(console, 'warn');
    TestBed.configureTestingModule({ imports: [TestModule] });
    TestBed.inject(PreferencesStore);
  });

  it('should generate a warning', () => {
    expect(console.warn).toHaveBeenCalled();
  });
});
