import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

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
