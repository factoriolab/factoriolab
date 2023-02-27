import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { LabState, Recipes, Settings } from '~/store';
import { MatrixComponent } from './matrix.component';
import { MatrixModule } from './matrix.module';

describe('MatrixComponent', () => {
  let component: MatrixComponent;
  let fixture: ComponentFixture<MatrixComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, MatrixModule],
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
    dispatch.val('setCostMachine', Settings.SetCostMachineAction);
    dispatch.val('setCostInput', Settings.SetCostInputAction);
    dispatch.val('setCostIgnored', Settings.SetCostIgnoredAction);
    dispatch.idVal('setRecipeCost', Recipes.SetCostAction);
    dispatch.void('resetCost', Settings.ResetCostAction);
    dispatch.void('resetRecipeCost', Recipes.ResetCostAction);
  });
});
