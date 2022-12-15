import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockStore } from '@ngrx/store/testing';

import { TestModule } from 'src/tests';
import { Game } from '~/models';
import { ErrorService } from '~/services';
import { AppSharedModule } from '~/shared';
import { App, LabState } from '~/store';
import { components } from './components';
import { MainComponent } from './main.component';
import { modules } from './main.module';
import { pipes } from './pipes';
import { MainSharedModule } from './shared/main-shared.module';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;
  let errorSvc: ErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [...components, ...pipes, MainComponent],
      imports: [TestModule, AppSharedModule, MainSharedModule, ...modules],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    errorSvc = TestBed.inject(ErrorService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('tryFixSimplex', () => {
    it('should set loading indicator and dispatch actions', fakeAsync(() => {
      spyOn(mockStore, 'dispatch');
      component.tryFixSimplex();
      expect(component.isFixingSimplex).toBeTrue();
      tick(100);
      expect(mockStore.dispatch).toHaveBeenCalledTimes(2);
      expect(component.isFixingSimplex).toBeFalse();
    }));
  });

  describe('reset', () => {
    it('should set loading indicator and reset application', fakeAsync(() => {
      spyOn(errorSvc.message$, 'next');
      spyOn(router, 'navigateByUrl');
      spyOn(mockStore, 'dispatch');
      component.reset(Game.Factorio);
      expect(component.isResetting).toBeTrue();
      tick(100);
      expect(errorSvc.message$.next).toHaveBeenCalledWith(null);
      expect(router.navigateByUrl).toHaveBeenCalledWith('factorio');
      expect(mockStore.dispatch).toHaveBeenCalledWith(new App.ResetAction());
      expect(component.isResetting).toBeFalse();
    }));
  });
});
