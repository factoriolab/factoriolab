import { ComponentFixture, TestBed } from '@angular/core/testing';

import { initialColumnsState } from '~/state/preferences/columns-state';
import { TestModule } from '~/tests/test-module';

import { ColumnsDialog } from './columns-dialog';

describe('ColumnsDialog', () => {
  let component: ColumnsDialog;
  let fixture: ComponentFixture<ColumnsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ColumnsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reset', () => {
    it('should set the value back to the initial state', () => {
      component['value'] = null as any;
      component.reset();
      expect(component['value']).toEqual(initialColumnsState);
    });
  });

  describe('save', () => {
    it('should dispatch the action and close the dialog', () => {
      spyOn(component['preferencesStore'], 'apply');
      spyOn(component['dialogRef'], 'close');
      component.save();
      expect(component['preferencesStore'].apply).toHaveBeenCalledWith({
        columns: component['value'],
        powerUnit: component['powerUnit'](),
      });
      expect(component['dialogRef'].close).toHaveBeenCalled();
    });
  });
});
