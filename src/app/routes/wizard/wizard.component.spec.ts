import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { ObjectiveType, ObjectiveUnit, rational } from '~/models';
import { LabState, Objectives, Settings } from '~/store';
import { DispatchTest, ItemId, RecipeId, TestModule } from '~/tests';

import { WizardComponent } from './wizard.component';

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
      component.selectId(ItemId.IronPlate, 'item');
      expect(component.id).toEqual(ItemId.IronPlate);
      expect(component.state).toEqual('item');
    });
  });

  it('should dispatch actions', () => {
    spyOn(component.router, 'navigate').and.returnValue(Promise.resolve(true));
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('setDisplayRate', Settings.setDisplayRate);
    dispatch.spy.calls.reset();
    component.createItemObjective(ItemId.IronPlate);
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      Objectives.create({
        objective: {
          id: '0',
          targetId: ItemId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      }),
    );
    dispatch.spy.calls.reset();
    component.createRecipeObjective(RecipeId.IronPlate);
    expect(dispatch.mockStore.dispatch).toHaveBeenCalledWith(
      Objectives.create({
        objective: {
          id: '0',
          targetId: ItemId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
      }),
    );
  });
});
