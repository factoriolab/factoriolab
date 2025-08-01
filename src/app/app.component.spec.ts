import { HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SwUpdate,
  UnrecoverableStateEvent,
  VersionEvent,
} from '@angular/service-worker';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { TestModule } from './tests';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let http: HttpTestingController;
  const swUpdate = {
    unrecoverable: new Subject<UnrecoverableStateEvent>(),
    versionUpdates: new Subject<VersionEvent>(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, AppComponent],
      providers: [{ provide: SwUpdate, useValue: swUpdate }],
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

    it('should handle unrecoverable updates', () => {
      spyOn(component.contentSvc, 'reload');
      spyOn(component.contentSvc, 'confirm').and.callFake((confirm) => {
        confirm.accept?.();
        confirm.reject?.();
        expect(component.contentSvc.reload).toHaveBeenCalledTimes(2);
      });
      swUpdate.unrecoverable.next({} as any);
      expect(component.contentSvc.confirm).toHaveBeenCalled();
    });

    it('should handle version updates', () => {
      spyOn(component.contentSvc, 'reload');
      spyOn(component.contentSvc, 'confirm').and.callFake((confirm) => {
        confirm.accept?.();
        confirm.reject?.();
        expect(component.contentSvc.reload).toHaveBeenCalledTimes(1);
      });
      swUpdate.versionUpdates.next({ type: 'VERSION_READY' } as any);
      expect(component.contentSvc.confirm).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should set loading indicator and reset application', async () => {
      spyOn(component.dataSvc.error$, 'next');
      spyOn(component.router, 'navigate');
      spyOn(component.contentSvc, 'reload');
      await component.reset();
      expect(component.dataSvc.error$.next).toHaveBeenCalledWith(undefined);
      expect(component.router.navigate).toHaveBeenCalledWith(['/']);
      expect(component.contentSvc.reload).toHaveBeenCalled();
    });
  });
});
