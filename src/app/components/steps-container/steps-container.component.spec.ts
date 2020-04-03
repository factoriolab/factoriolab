import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';

import * as mocks from 'src/mocks';
import { reducers, metaReducers, State } from '~/store';
import * as recipe from '~/store/recipe';
import { IconComponent } from '../icon/icon.component';
import { StepsComponent } from './steps/steps.component';
import { StepsContainerComponent } from './steps-container.component';

describe('StepsContainerComponent', () => {
  let component: StepsContainerComponent;
  let fixture: ComponentFixture<StepsContainerComponent>;
  let store: Store<State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [IconComponent, StepsComponent, StepsContainerComponent]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(StepsContainerComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should edit beacon count', () => {
    spyOn(store, 'dispatch');
    const data: [string, number] = [mocks.Item1.id, 24];
    component.child.editBeaconCount.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new recipe.EditBeaconCountAction(data)
    );
  });
});
