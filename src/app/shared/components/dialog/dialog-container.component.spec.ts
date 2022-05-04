import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { DialogContainerComponent } from './dialog-container.component';

describe('DialogContainerComponent', () => {
  let component: DialogContainerComponent;
  let fixture: ComponentFixture<DialogContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogContainerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('cancel', () => {
    it('should set open to false', () => {
      component.open = true;
      component.cancel();
      expect(component.open).toBeFalse();
    });
  });

  describe('moduleRows', () => {
    it('should build rows of options', () => {
      const result = component.moduleRows([
        ItemId.SpeedModule,
        ItemId.SpeedModule2,
        ItemId.ProductivityModule,
        ItemId.ProductivityModule3,
      ]);
      expect(result).toEqual([
        [ItemId.ProductivityModule, ItemId.ProductivityModule3],
        [ItemId.SpeedModule, ItemId.SpeedModule2],
      ]);
    });

    it('should handle null match from regex', () => {
      const result = component.moduleRows(['', ItemId.SpeedModule]);
      expect(result).toEqual([[''], [ItemId.SpeedModule]]);
    });
  });
});
