import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { Preferences } from '~/store';
import { ColumnsComponent } from './columns.component';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;
  let markForCheck: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ColumnsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsComponent);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    markForCheck = spyOn(ref.constructor.prototype, 'markForCheck');
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

  describe('ngOnInit', () => {
    it('should watch subject to show dialog', () => {
      component.contentSvc.showColumns$.next();
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
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
      expect(component.editValue).toEqual(Preferences.initialState.columns);
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(component.store, 'dispatch');
      component.onHide();
      expect(component.store.dispatch).toHaveBeenCalledWith(
        Preferences.setColumns({ columns: component.editValue as any }),
      );
    });
  });
});
