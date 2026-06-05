import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TestModule } from '~/tests/test-module';

import { Preferences } from './preferences';

describe('Preferences', () => {
  let component: Preferences;
  let fixture: ComponentFixture<Preferences>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Preferences],
    }).compileComponents();

    fixture = TestBed.createComponent(Preferences);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('state', () => {
    it('should find a state that matches params', () => {
      spyOn(component, 'params').and.returnValue('params');
      spyOn(component['settingsStore'], 'modStates').and.returnValue({
        state: 'params',
      });
      expect(component.state()).toEqual('state');
    });
  });

  describe('reset', () => {
    it('should handle preserve saved states', () => {
      spyOn(component['confirm'], 'open').and.returnValue(of(1));
      spyOn(component['preferencesStore'], 'apply');
      component.reset();
      expect(component['preferencesStore'].apply).toHaveBeenCalled();
    });

    it('should handle full reset', async () => {
      spyOn(component['confirm'], 'open').and.returnValue(of(2));
      spyOn(window.localStorage, 'clear');
      spyOn(component['router'], 'navigate').and.returnValue(
        Promise.resolve(true),
      );
      spyOn(component['windowClient'], 'reload');
      component.reset();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['windowClient'].reload).toHaveBeenCalled();
    });
  });

  describe('saveState', () => {
    it('should return if there is nothing to save', () => {
      spyOn(component['preferencesStore'], 'saveState');
      component.saveState();
      expect(component['preferencesStore'].saveState).not.toHaveBeenCalled();
    });

    it('should edit a saved state', () => {
      component.editValue.set('value');
      component.editStatus.set('edit');
      spyOn(component, 'params').and.returnValue('params');
      spyOn(component['preferencesStore'], 'saveState');
      spyOn(component, 'state').and.returnValue('state');
      spyOn(component['preferencesStore'], 'removeState');
      component.saveState();
      expect(component['preferencesStore'].saveState).toHaveBeenCalled();
      expect(component['preferencesStore'].removeState).toHaveBeenCalled();
    });
  });

  describe('setState', () => {
    it('should return if no matching state is found', async () => {
      spyOn(component['router'], 'navigate');
      await component.setState('state');
      expect(component['router'].navigate).not.toHaveBeenCalled();
    });

    it('should set the state and navigate', async () => {
      spyOn(component['settingsStore'], 'modStates').and.returnValue({
        state: 'query',
      });
      spyOn(component['router'], 'navigate').and.returnValue(
        Promise.resolve(true),
      );
      await component.setState('state');
      expect(component['router'].navigate).toHaveBeenCalled();
      expect(component.state()).toEqual('state');
    });
  });

  describe('createState', () => {
    it('should set up the editor to create a new state', () => {
      spyOn(component.editValue, 'set');
      spyOn(component.editStatus, 'set');
      component.createState();
      expect(component.editValue.set).toHaveBeenCalledWith('');
      expect(component.editStatus.set).toHaveBeenCalledWith('create');
    });
  });

  describe('editState', () => {
    it('should set up the editor to edit a state', () => {
      spyOn(component.editValue, 'set');
      spyOn(component.editStatus, 'set');
      component.editState('state');
      expect(component.editValue.set).toHaveBeenCalledWith('state');
      expect(component.editStatus.set).toHaveBeenCalledWith('edit');
    });
  });

  describe('deleteState', () => {
    it('should remove the state from the PreferencesStore', () => {
      spyOn(component['preferencesStore'], 'removeState');
      spyOn(component.state, 'set');
      component.deleteState('state');
      expect(component['preferencesStore'].removeState).toHaveBeenCalled();
      expect(component.state.set).toHaveBeenCalledWith('');
    });
  });
});
