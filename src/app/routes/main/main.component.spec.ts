import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { reset } from '~/store/app.actions';
import { TestModule } from '~/tests';

import { MainComponent } from './main.component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, MainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('reset', () => {
    it('should set loading indicator and reset application', fakeAsync(() => {
      spyOn(component.errorSvc.message, 'set');
      spyOn(component.router, 'navigateByUrl');
      spyOn(component.store, 'dispatch');
      component.reset();
      expect(component.isResetting).toBeTrue();
      tick(100);
      expect(component.errorSvc.message.set).toHaveBeenCalledWith(null);
      expect(component.router.navigateByUrl).toHaveBeenCalledWith('/1.1');
      expect(component.store.dispatch).toHaveBeenCalledWith(reset());
      expect(component.isResetting).toBeFalse();
    }));
  });
});
