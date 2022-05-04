import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('click', () => {
    it('should set opening to false on first click', () => {
      document.body.click();
      expect(component.opening).toBeFalse();
    });

    it('should close the dialog', () => {
      spyOn(component.closeDialog, 'emit');
      component.opening = false;
      document.body.click();
      expect(component.closeDialog.emit).toHaveBeenCalled();
    });

    it('should ignore click on this element', () => {
      spyOn(component.closeDialog, 'emit');
      component.opening = false;
      fixture.nativeElement.click();
      expect(component.closeDialog.emit).not.toHaveBeenCalled();
    });
  });
});
