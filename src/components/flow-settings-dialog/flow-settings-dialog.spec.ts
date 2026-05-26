import { ComponentFixture, TestBed } from '@angular/core/testing';

import { initialPreferencesState } from '~/state/preferences/preferences-state';
import { TestModule } from '~/tests/test-module';

import { FlowSettingsDialog } from './flow-settings-dialog';

describe('FlowSettingsDialog', () => {
  let component: FlowSettingsDialog;
  let fixture: ComponentFixture<FlowSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, FlowSettingsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(FlowSettingsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reset', () => {
    it('should reset the editValue', () => {
      spyOn(component['editValue'], 'set');
      component.reset();
      expect(component['editValue'].set).toHaveBeenCalledWith(
        initialPreferencesState.flowSettings,
      );
    });
  });

  describe('save', () => {
    it('should apply the editValue and close the dialog', () => {
      spyOn(component['preferencesStore'], 'apply');
      spyOn(component['dialogRef'], 'close');
      component.save();
      expect(component['preferencesStore'].apply).toHaveBeenCalled();
      expect(component['dialogRef'].close).toHaveBeenCalled();
    });
  });
});
