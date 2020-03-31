import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import { reducers, metaReducers } from '../../store';
import { IconComponent } from '../icon/icon.component';
import { StepsComponent } from './steps/steps.component';
import { StepsContainerComponent } from './steps-container.component';

describe('StepsContainerComponent', () => {
  let component: StepsContainerComponent;
  let fixture: ComponentFixture<StepsContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [IconComponent, StepsComponent, StepsContainerComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(StepsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
