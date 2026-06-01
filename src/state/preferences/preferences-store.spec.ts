import { TestBed } from '@angular/core/testing';

import { PreferencesStore } from './preferences-store';

describe('PreferencesStore', () => {
  let service: PreferencesStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreferencesStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should log if failed to parse stored preferences', () => {
      spyOn(console, 'warn');
      spyOn(localStorage, 'getItem').and.returnValue('abc');
      TestBed.runInInjectionContext(() => {
        service = new PreferencesStore();
      });
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('effects', () => {
    it('should apply light theme', () => {
      spyOn(document.documentElement, 'setAttribute');
      service.apply({ theme: 'light' });
      TestBed.tick();
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light',
      );
    });

    it('should apply dark theme', () => {
      spyOn(document.documentElement, 'removeAttribute');
      service.apply({ theme: 'dark' });
      TestBed.tick();
      expect(document.documentElement.removeAttribute).toHaveBeenCalledWith(
        'data-theme',
      );
    });

    it('should apply system light theme', () => {
      spyOn(window, 'matchMedia').and.returnValue({ matches: true } as any);
      spyOn(document.documentElement, 'setAttribute');
      service.apply({ theme: 'system' });
      TestBed.tick();
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light',
      );
    });
  });

  describe('saveState', () => {
    it('should save the state', () => {
      service.saveState('factorio', 'id', 'value');
      expect(service.state().states['factorio']['id']).toEqual('value');
    });
  });

  describe('removeState', () => {
    it('should remove the state', () => {
      service.saveState('factorio', 'id', 'value');
      service.removeState('factorio', 'id');
      expect(service.state().states['factorio']['id']).toBeUndefined();
    });
  });

  describe('setSectionDefault', () => {
    it('should update section state', () => {
      service.setSectionDefault('inputs', false);
      expect(service.state().sections.inputs).toBeFalse();
    });
  });
});
