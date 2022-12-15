import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { TestModule } from 'src/tests';
import { Column } from '~/models';
import { ContentService } from '~/services';
import { Preferences } from '~/store';
import { modules } from '../../main.module';
import { pipes } from '../../pipes';
import { ColumnsDialogComponent } from './columns-dialog.component';

describe('ColumnsDialogComponent', () => {
  let component: ColumnsDialogComponent;
  let fixture: ComponentFixture<ColumnsDialogComponent>;
  let markForCheck: jasmine.Spy;
  let mockStore: MockStore;
  let contentSvc: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [...pipes, ColumnsDialogComponent],
      imports: [TestModule, ...modules],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnsDialogComponent);
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

  describe('ngOnInit', () => {
    it('should watch subject to show dialog', () => {
      contentSvc.showColumns$.next();
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });
  });

  describe('changeFraction', () => {
    it('should set precision fraction state', () => {
      component.changeFraction(true, Column.Items);
      expect(component.editValue[Column.Items].precision).toEqual(null);
      component.changeFraction(false, Column.Items);
      expect(component.editValue[Column.Items].precision).toEqual(1);
    });
  });

  describe('save', () => {
    it('should dispatch the action', () => {
      spyOn(mockStore, 'dispatch');
      component.save();
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Preferences.SetColumnsAction(component.editValue)
      );
    });
  });
});
