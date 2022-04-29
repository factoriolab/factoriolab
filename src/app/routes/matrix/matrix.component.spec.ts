import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { DispatchTest, initialState } from 'src/tests';
import { SharedModule } from '~/shared/shared.module';
import { LabState } from '~/store';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { MatrixComponent } from './matrix.component';

describe('MatrixComponent', () => {
  let component: MatrixComponent;
  let fixture: ComponentFixture<MatrixComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatrixComponent],
      imports: [FormsModule, SharedModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatrixComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.val('setCostFactor', Settings.SetCostFactorAction);
    dispatch.val('setCostFactory', Settings.SetCostFactoryAction);
    dispatch.val('setCostInput', Settings.SetCostInputAction);
    dispatch.val('setCostIgnored', Settings.SetCostIgnoredAction);
    dispatch.idVal('setRecipeCost', Recipes.SetCostAction);
    dispatch.void('resetCost', Settings.ResetCostAction);
    dispatch.void('resetRecipeCost', Recipes.ResetCostAction);
  });
});
