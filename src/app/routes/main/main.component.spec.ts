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
import { App, LabState } from '~/store';
import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;
  let errorSvc: ErrorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainComponent],
      imports: [TestModule],
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
