import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';

import { DefaultIdPayload } from '~/models';
import { reducers, State, metaReducers } from '~/store';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { MatrixComponent } from './matrix/matrix.component';
import { MatrixContainerComponent } from './matrix-container.component';

describe('MatrixContainerComponent', () => {
  let component: MatrixContainerComponent;
  let fixture: ComponentFixture<MatrixContainerComponent>;
  let store: Store<State>;
  const value = '5';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatrixContainerComponent, MatrixComponent],
      imports: [StoreModule.forRoot(reducers, { metaReducers })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the recipe cost multiplier', () => {
    component.child.setCostFactor.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetCostFactorAction(value)
    );
  });

  it('should set the factory cost multiplier', () => {
    component.child.setCostFactory.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetCostFactoryAction(value)
    );
  });

  it('should set the input cost', () => {
    component.child.setCostInput.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetCostInputAction(value)
    );
  });

  it('should set the ignored cost', () => {
    component.child.setCostIgnored.emit(value);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetCostIgnoredAction(value)
    );
  });

  it('should set the recipe cost', () => {
    const data: DefaultIdPayload = { id: 'id', value, def: null };
    component.child.setRecipeCost.emit(data);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Recipes.SetCostAction(data)
    );
  });

  it('should reset cost modifiers', () => {
    component.child.resetCost.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Settings.ResetCostAction());
  });

  it('should reset the recipe cost', () => {
    component.child.resetRecipeCost.emit();
    expect(store.dispatch).toHaveBeenCalledWith(new Recipes.ResetCostAction());
  });
});
