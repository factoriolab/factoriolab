import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import { MatrixResultType } from '~/models';
import { LabState, Objectives, Settings } from '~/store';
import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObjectivesComponent],
      imports: [AppSharedModule, TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectivesComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMessages', () => {
    it('should build an error message to display to the user', () => {
      const result = component.getMessages({
        steps: [],
        resultType: MatrixResultType.Failed,
      });
      expect(result.length).toEqual(1);
    });

    it('should build specific error messages to display to the user', () => {
      let result = component.getMessages({
        steps: [],
        resultType: MatrixResultType.Failed,
        simplexStatus: 'unbounded',
      });
      expect(result[0].summary).toEqual('objectives.errorUnbounded');

      result = component.getMessages({
        steps: [],
        resultType: MatrixResultType.Failed,
        simplexStatus: 'no_feasible',
      });
      expect(result[0].summary).toEqual('objectives.errorInfeasible');
    });
  });

  // it('should dispatch actions', () => {
  //   const dispatch = new DispatchTest(mockStore, component);
  //   dispatch.val('removeItemObjective', ItemObjectives.RemoveAction);
  //   dispatch.idVal('setItem', ItemObjectives.SetItemAction);
  //   dispatch.idVal('setRate', ItemObjectives.SetRateAction);
  //   dispatch.idVal('setRateUnit', ItemObjectives.SetRateUnitAction);
  //   dispatch.idVal('setItemType', ItemObjectives.SetTypeAction);
  //   dispatch.val('removeRecipeObjective', RecipeObjectives.RemoveAction);
  //   dispatch.idVal('setRecipe', RecipeObjectives.SetRecipeAction);
  //   dispatch.idVal('setCount', RecipeObjectives.SetCountAction);
  //   dispatch.idVal('setRecipeType', RecipeObjectives.SetTypeAction);
  //   dispatch.val('addItemObjective', ItemObjectives.AddAction);
  //   dispatch.val('addRecipeObjective', RecipeObjectives.AddAction);
  //   dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
  // });
});
