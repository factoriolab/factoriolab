import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';

import * as mocks from 'src/mocks';
import { IconComponent } from '~/components';
import { RecipeId, ItemId } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as recipe from '~/store/recipe';
import { StepsComponent } from './steps/steps.component';
import { StepsContainerComponent } from './steps-container.component';

describe('StepsContainerComponent', () => {
  let component: StepsContainerComponent;
  let fixture: ComponentFixture<StepsContainerComponent>;
  let store: Store<State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [IconComponent, StepsComponent, StepsContainerComponent],
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

  it('should ignore a recipe', () => {
    spyOn(store, 'dispatch');
    const data = mocks.Recipe1.id;
    component.child.ignoreStep.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new recipe.IgnoreAction(data));
  });

  it('should edit factory module', () => {
    spyOn(store, 'dispatch');
    const data: [RecipeId, ItemId[]] = [mocks.Recipe1.id, [ItemId.SpeedModule]];
    component.child.editFactoryModule.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new recipe.EditFactoryModuleAction(data)
    );
  });

  it('should edit beacon module', () => {
    spyOn(store, 'dispatch');
    const data: [RecipeId, ItemId] = [mocks.Recipe1.id, ItemId.SpeedModule];
    component.child.editBeaconModule.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new recipe.EditBeaconModuleAction(data)
    );
  });

  it('should edit beacon count', () => {
    spyOn(store, 'dispatch');
    const data: [RecipeId, number] = [mocks.Recipe1.id, 24];
    component.child.editBeaconCount.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new recipe.EditBeaconCountAction(data)
    );
  });

  it('should reset step to default', () => {
    spyOn(store, 'dispatch');
    const data = mocks.Recipe1.id;
    component.child.resetStep.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(new recipe.ResetAction(data));
  });
});
