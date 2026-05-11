import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getSelector, TestModule } from '~/tests';

import { Error } from './error';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Error],
    }).compileComponents();

    fixture = TestBed.createComponent(Error);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template', () => {
    it('should render error message', () => {
      (component as any).info = { message: 'error message' };
      fixture.detectChanges();
      expect(getSelector(fixture, '[data-test=message]').textContent).toContain(
        'error message',
      );
    });

    it('should render delete button', () => {
      component['settingsStore'].customData.set({} as any);
      fixture.detectChanges();
      vi.spyOn(component, 'deleteCustom');
      getSelector(fixture, 'button').click();
      expect(component.deleteCustom).toHaveBeenCalled();
    });
  });

  describe('deleteCustom', () => {
    it('should wait for navigation and reload', async () => {
      vi.spyOn(component['router'], 'navigate').mockReturnValue(
        Promise.resolve(true),
      );
      vi.spyOn(component['windowClient'], 'reload');
      await component.deleteCustom();
      expect(component['router'].navigate).toHaveBeenCalled();
      expect(component['windowClient'].reload).toHaveBeenCalled();
    });
  });
});
