import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mocks } from 'src/tests';

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

    it('should cancel propagation on event', () => {
      spyOn(Mocks.Event, 'stopPropagation');
      component.cancel(Mocks.Event);
      expect(Mocks.Event.stopPropagation).toHaveBeenCalled();
    });
  });
});
