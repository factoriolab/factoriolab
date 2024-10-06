import { ComponentFixture, TestBed } from '@angular/core/testing';

import { initialPreferencesState } from '~/store/preferences.service';
import { Mocks, TestModule } from '~/tests';

import { ColumnsComponent } from './columns.component';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ColumnsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsComponent);
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
      component.editValue['wagons'].show = false;
      expect(component.modified).toBeTrue();
    });
  });

  describe('open', () => {
    it('should set up the editValue and show the dialog', () => {
      spyOn(component, 'show');
      component.editValue = null as any;
      component.open(Mocks.preferencesState.columns);
      expect(component.editValue).toEqual(Mocks.preferencesState.columns);
      expect(component.editValue).not.toBe(Mocks.preferencesState.columns);
      expect(component.show).toHaveBeenCalled();
    });
  });

  describe('changeFraction', () => {
    it('should set precision fraction state', () => {
      component.changeFraction(true, 'items');
      expect(component.editValue['items'].precision).toEqual(null);
      component.changeFraction(false, 'items');
      expect(component.editValue['items'].precision).toEqual(1);
    });
  });

  describe('reset', () => {
    it('should set the value back to the initial state', () => {
      component.editValue = null as any;
      component.reset();
      expect(component.editValue).toEqual(initialPreferencesState.columns);
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(component.preferencesSvc, 'apply');
      component.onHide();
      expect(component.preferencesSvc.apply).toHaveBeenCalledWith({
        columns: component.editValue as any,
      });
    });
  });
});
