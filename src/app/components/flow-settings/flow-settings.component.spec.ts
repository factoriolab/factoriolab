import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowDiagram } from '~/models/enum/flow-diagram';
import { initialPreferencesState } from '~/store/preferences.service';
import { Mocks, TestModule } from '~/tests';

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
      component.open(Mocks.flowSettings);
      expect(component.editValue).toEqual(Mocks.flowSettings);
      expect(component.editValue).not.toBe(Mocks.flowSettings);
      expect(component.show).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set the value back to the initial state', () => {
      component.editValue = null as any;
      component.reset();
      expect(component.editValue).toEqual(initialPreferencesState.flowSettings);
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(component.preferencesSvc, 'apply');
      component.onHide();
      expect(component.preferencesSvc.apply).toHaveBeenCalledWith({
        flowSettings: component.editValue,
      });
    });
  });
});
