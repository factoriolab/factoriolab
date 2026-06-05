import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { initialSettingsState } from '~/state/settings/settings-state';
import { TestModule } from '~/tests/test-module';

import { CostSettingsDialog } from './cost-settings-dialog';

describe('CostSettingsDialog', () => {
  let component: CostSettingsDialog;
  let fixture: ComponentFixture<CostSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CostSettingsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(CostSettingsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('apply', () => {
    it('should update the editValue signal by the passed key / value pair', () => {
      component.apply('excluded', rational(10n));
      expect(component['editValue']().excluded.eq(rational(10n))).toBeTrue();
    });
  });

  describe('reset', () => {
    it('should reset the edit value to its intial state', () => {
      spyOn(component['editValue'], 'set');
      component.reset();
      expect(component['editValue'].set).toHaveBeenCalledWith(
        initialSettingsState.costs,
      );
    });
  });

  describe('save', () => {
    it('should dispatch the action and close the dialog', () => {
      spyOn(component['settingsStore'], 'apply');
      spyOn(component['dialogRef'], 'close');
      component.save();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        costs: component['editValue'](),
      });
      expect(component['dialogRef'].close).toHaveBeenCalled();
    });
  });
});
