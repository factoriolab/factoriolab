import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, RecipeId, TestModule } from 'src/tests';
import { ObjectiveType, ObjectiveUnit } from '~/models';
import { LabState, Objectives, Settings } from '~/store';
import { WizardComponent, WizardState } from './wizard.component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, WizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('selectId', () => {
    it('should set the id and state', () => {
      component.selectId(ItemId.IronPlate, WizardState.ItemObjective);
      expect(component.id).toEqual(ItemId.IronPlate);
      expect(component.state).toEqual(WizardState.ItemObjective);
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
    dispatch.spy.calls.reset();
    component.createItemObjective(ItemId.IronPlate, '1', ObjectiveUnit.Items);
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      new Objectives.CreateAction({
        id: '0',
        targetId: ItemId.IronPlate,
        value: '1',
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      }),
    );
    dispatch.spy.calls.reset();
    component.createRecipeObjective(RecipeId.IronPlate, '1');
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      new Objectives.CreateAction({
        id: '0',
        targetId: ItemId.IronPlate,
        value: '1',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      }),
    );
  });
});
