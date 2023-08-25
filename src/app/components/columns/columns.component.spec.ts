import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { TestModule } from 'src/tests';
import { ContentService } from '~/services';
import { Preferences } from '~/store';
import { ColumnsComponent } from './columns.component';

describe('ColumnsComponent', () => {
  let component: ColumnsComponent;
  let fixture: ComponentFixture<ColumnsComponent>;
  let markForCheck: jasmine.Spy;
  let mockStore: MockStore;
  let contentSvc: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColumnsComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsComponent);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    markForCheck = spyOn(ref.constructor.prototype, 'markForCheck');
    mockStore = TestBed.inject(MockStore);
    contentSvc = TestBed.inject(ContentService);
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
      contentSvc.showColumns$.next();
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
      expect(component.editValue).toEqual(
        Preferences.initialPreferencesState.columns,
      );
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(mockStore, 'dispatch');
      component.save();
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Preferences.SetColumnsAction(component.editValue as any),
      );
    });
  });
});
