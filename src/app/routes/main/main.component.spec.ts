import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

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
      spyOn(component.errorSvc.message$, 'next');
      spyOn(component.router, 'navigate');
      component.reset();
      expect(component.isResetting).toBeTrue();
      tick(100);
      expect(component.errorSvc.message$.next).toHaveBeenCalledWith(undefined);
      expect(component.router.navigate).toHaveBeenCalledWith(['/1.1']);
      expect(component.isResetting).toBeFalse();
    }));
  });
});
