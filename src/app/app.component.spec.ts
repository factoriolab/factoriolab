import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { TestModule } from './tests';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    http = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should log the version info', () => {
      spyOn(console, 'log');
      spyOn(component.analyticsSvc, 'event');
      http.expectOne('assets/release.json').flush({ version: 'version' });
      expect(console.log).toHaveBeenCalledWith('FactorioLab version (test)');
      expect(component.analyticsSvc.event).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set loading indicator and reset application', () => {
      spyOn(component.dataSvc.error$, 'next');
      spyOn(component.router, 'navigate');
      spyOn(component, 'reload');
      component.reset();
      expect(component.dataSvc.error$.next).toHaveBeenCalledWith(undefined);
      expect(component.router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.reload).toHaveBeenCalled();
    });
  });
});
