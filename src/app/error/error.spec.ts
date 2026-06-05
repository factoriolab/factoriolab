import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { TestModule } from '~/tests/test-module';

import { Error, errorGuard } from './error';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Error],
    }).compileComponents();

    fixture = TestBed.createComponent(Error);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('errorGuard', () => {
    it('should redirect to root if no error is in navigation data', () => {
      TestBed.runInInjectionContext(() => {
        const result = errorGuard(null as any, null as any);
        expect(result).toBeInstanceOf(UrlTree);
      });
    });

    it('should proceed if error is present', () => {
      spyOn(router, 'currentNavigation').and.returnValue({
        extras: { info: {} },
      } as any);
      TestBed.runInInjectionContext(() => {
        const result = errorGuard(null as any, null as any);
        expect(result).toEqual(true);
      });
    });
  });

  describe('deleteCustom', () => {
    it('should wait for navigation and reload', async () => {
      spyOn(component['router'], 'navigate').and.returnValue(
        Promise.resolve(true),
      );
      spyOn(component['windowClient'], 'reload');
      await component.deleteCustom();
      expect(component['router'].navigate).toHaveBeenCalled();
      expect(component['windowClient'].reload).toHaveBeenCalled();
    });
  });
});
