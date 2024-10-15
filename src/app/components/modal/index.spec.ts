import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { DialogComponent, ModalComponent, OverlayComponent } from './index';

class TestModalComponent extends ModalComponent {
  save(): void {}
}

describe('ModalComponent', () => {
  let component: TestModalComponent;
  let fixture: ComponentFixture<TestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestModalComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onHide', () => {
    it('should save, if the modal was not cancelled', () => {
      const spy = spyOn(component, 'save');
      component.onHide();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();
      component.cancel.set(true);
      component.onHide();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

class TestDialogComponent extends DialogComponent {
  save(): void {}
}

describe('DialogComponent', () => {
  let component: TestDialogComponent;
  let fixture: ComponentFixture<TestDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestDialogComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hide', () => {
    it('should cancel the modal', () => {
      spyOn(component.cancel, 'set');
      component.visible = true;
      component.hide(true);
      expect(component.cancel.set).toHaveBeenCalledWith(true);
      expect(component.visible).toBeFalse();
    });
  });

  describe('show', () => {
    it('should reset and show the modal', () => {
      spyOn(component.cancel, 'set');
      component.visible = false;
      component.show();
      expect(component.cancel.set).toHaveBeenCalledWith(false);
      expect(component.visible).toBeTrue();
    });
  });
});

class TestOverlayComponent extends OverlayComponent {
  show(event: Event): void {
    this._show(event);
  }

  save(): void {}
}

describe('OverlayComponent', () => {
  let component: TestOverlayComponent;
  let fixture: ComponentFixture<TestOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestOverlayComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('hide', () => {
    it('should cancel the modal', () => {
      spyOn(component.cancel, 'set');
      const panel = { hide: (): void => {} };
      spyOn(panel, 'hide');
      spyOn(component, 'overlayPanel').and.returnValue(panel as any);
      component.hide(true);
      expect(component.cancel.set).toHaveBeenCalledWith(true);
      expect(panel.hide).toHaveBeenCalled();
    });
  });

  describe('show', () => {
    it('should cancel the modal', () => {
      spyOn(component.cancel, 'set');
      const panel = { toggle: (_: any): void => {} };
      const event = {};
      spyOn(panel, 'toggle');
      spyOn(component, 'overlayPanel').and.returnValue(panel as any);
      component.show(event as any);
      expect(component.cancel.set).toHaveBeenCalledWith(false);
      expect(panel.toggle).toHaveBeenCalledWith(event as any);
    });
  });
});
