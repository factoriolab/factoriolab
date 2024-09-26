import { TestBed } from '@angular/core/testing';

import { Game } from '~/models/enum/game';
import { Theme } from '~/models/enum/theme';
import { TestModule } from '~/tests';

import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  let service: PreferencesService;

  beforeEach(() => {
    localStorage.setItem('preferences', '{"theme":"black"}');
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(PreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load from local storage', () => {
    expect(service.state().theme).toEqual(Theme.Black);
  });

  describe('saveState', () => {
    it('should save the state', () => {
      service.saveState(Game.Factorio, 'id', 'value');
      expect(service.state().states[Game.Factorio]['id']).toEqual('value');
    });
  });

  describe('removeState', () => {
    it('should remove the state', () => {
      service.saveState(Game.Factorio, 'id', 'value');
      service.removeState(Game.Factorio, 'id');
      expect(service.state().states[Game.Factorio]['id']).toBeUndefined();
    });
  });
});

describe('PreferencesService Error', () => {
  beforeEach(() => {
    localStorage.setItem('preferences', '{');
    spyOn(console, 'warn');
    TestBed.configureTestingModule({ imports: [TestModule] });
    TestBed.inject(PreferencesService);
  });

  it('should generate a warning', () => {
    expect(console.warn).toHaveBeenCalled();
  });
});
