import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
import { FlowDiagram } from '~/models';
import { Preferences } from '~/store';
import { FlowSettingsComponent } from './flow-settings.component';

describe('FlowSettingsComponent', () => {
  let component: FlowSettingsComponent;
  let fixture: ComponentFixture<FlowSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, FlowSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlowSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('modified', () => {
    it('should determine whether the value matches the initial state', () => {
      component.reset();
      expect(component.modified).toBeFalse();
      component.editValue.diagram = FlowDiagram.BoxLine;
      expect(component.modified).toBeTrue();
    });
  });

  describe('open', () => {
    it('should set up the editValue and show the dialog', () => {
      spyOn(component, 'show');
      component.editValue = null as any;
      component.open(Mocks.FlowSettings);
      expect(component.editValue).toEqual(Mocks.FlowSettings);
      expect(component.editValue).not.toBe(Mocks.FlowSettings);
      expect(component.show).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set the value back to the initial state', () => {
      component.editValue = null as any;
      component.reset();
      expect(component.editValue).toEqual(
        Preferences.initialPreferencesState.flowSettings,
      );
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(component.store, 'dispatch');
      component.onHide();
      expect(component.store.dispatch).toHaveBeenCalledWith(
        new Preferences.SetFlowSettingsAction(component.editValue),
      );
    });
  });
});
