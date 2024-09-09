import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { DispatchTest, ItemId, Mocks, RecipeId, TestModule } from 'src/tests';

import { spread } from '~/helpers';
import {
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  rational,
  SimplexResultType,
} from '~/models';
import { LabState, Objectives, Preferences, Settings } from '~/store';

import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ObjectivesComponent],
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
    let result: Message[];

    beforeEach(() => (result = []));

    it('should return an info message when calculations are paused', () => {
      component
        .getMessages(
          [],
          { steps: [], resultType: SimplexResultType.Paused },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result.length).toEqual(1);
      expect(result[0].severity).toEqual('info');
    });

    it('should return no errors unless simplex failed', () => {
      component
        .getMessages(
          [],
          {
            steps: [],
            resultType: SimplexResultType.Skipped,
          },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result.length).toEqual(0);
    });

    it('should build an error message to display to the user', () => {
      component
        .getMessages(
          [],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
          },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result.length).toEqual(1);
    });

    it('should handle some specific known problems with specific error messages', () => {
      component
        .getMessages(
          [
            {
              id: '0',
              type: ObjectiveType.Maximize,
              targetId: ItemId.Coal,
              value: rational.one,
              unit: ObjectiveUnit.Items,
            },
          ],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
            simplexStatus: 'unbounded',
          },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorUnbounded');
      expect(
        result[0].detail?.startsWith('objectives.errorNoLimits'),
      ).toBeTrue();

      component
        .getMessages(
          [
            {
              id: '0',
              type: ObjectiveType.Maximize,
              targetId: ItemId.Coal,
              value: rational.one,
              unit: ObjectiveUnit.Items,
            },
            {
              id: '1',
              type: ObjectiveType.Limit,
              targetId: ItemId.Coal,
              value: rational.one,
              unit: ObjectiveUnit.Items,
            },
          ],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
            simplexStatus: 'unbounded',
          },
          spread(Mocks.SettingsStateInitial, {
            excludedItemIds: new Set([ItemId.Coal]),
          }),
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorUnbounded');
      expect(
        result[0].detail?.startsWith('objectives.errorMaximizeExcluded'),
      ).toBeTrue();

      component
        .getMessages(
          [
            {
              id: '0',
              type: ObjectiveType.Maximize,
              targetId: RecipeId.Coal,
              value: rational.one,
              unit: ObjectiveUnit.Machines,
            },
            {
              id: '1',
              type: ObjectiveType.Limit,
              targetId: ItemId.Coal,
              value: rational.one,
              unit: ObjectiveUnit.Items,
            },
          ],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
            simplexStatus: 'unbounded',
          },
          spread(Mocks.SettingsStateInitial, {
            excludedRecipeIds: new Set([RecipeId.Coal]),
          }),
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorUnbounded');
      expect(
        result[0].detail?.startsWith('objectives.errorMaximizeExcluded'),
      ).toBeTrue();
    });

    it('should build generic error messages for each simplex status', () => {
      component
        .getMessages(
          [],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
            simplexStatus: 'unbounded',
          },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorUnbounded');
      expect(
        result[0].detail?.startsWith('objectives.errorUnboundedDetail'),
      ).toBeTrue();

      component
        .getMessages(
          [],
          {
            steps: [],
            resultType: SimplexResultType.Failed,
            simplexStatus: 'no_feasible',
          },
          Mocks.SettingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorInfeasible');
    });
  });

  describe('setObjectiveOrder', () => {
    it('should map objectives to ids', () => {
      spyOn(component, 'setOrder');
      component.setObjectiveOrder(Mocks.ObjectivesList);
      expect(component.setOrder).toHaveBeenCalledWith(
        Mocks.ObjectivesList.map((o) => o.id),
      );
    });
  });

  describe('changeUnit', () => {
    const mockPicker = (id: string): any => {
      const picker = {
        selectId: new Subject<string>(),
        clickOpen: (): void => {},
      };
      picker.clickOpen = (): void => picker.selectId.next(id);
      return picker;
    };

    it('should do nothing if it cannot find a matching objective rational', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        Mocks.Objective5,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.setUnit).not.toHaveBeenCalled();
    });

    it('should do nothing if switching to and from machines', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        Mocks.Objective5,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.setUnit).not.toHaveBeenCalled();
    });

    it('should auto-switch from item to recipe', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        Mocks.Objective1,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.setUnit).toHaveBeenCalledWith(Mocks.Objective1.id, {
        targetId: RecipeId.AdvancedCircuit,
        unit: ObjectiveUnit.Machines,
      });
    });

    it('should prompt user to switch from item to recipe', () => {
      spyOn(component, 'setUnit');
      const objective: Objective = {
        id: '0',
        targetId: ItemId.PetroleumGas,
        value: rational.one,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      };
      component.changeUnit(
        objective,
        ObjectiveUnit.Machines,
        {} as any,
        mockPicker(RecipeId.AdvancedOilProcessing),
      );
      expect(component.setUnit).toHaveBeenCalledWith('0', {
        targetId: RecipeId.AdvancedOilProcessing,
        unit: ObjectiveUnit.Machines,
      });
    });

    it('should auto-switch from recipe to item', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        Mocks.Objective5,
        ObjectiveUnit.Items,
        {} as any,
        {} as any,
      );
      expect(component.setUnit).toHaveBeenCalledWith(Mocks.Objective5.id, {
        targetId: ItemId.PiercingRoundsMagazine,
        unit: ObjectiveUnit.Items,
      });
    });

    it('should prompt user to switch from recipe to item', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        {
          id: '0',
          targetId: RecipeId.AdvancedOilProcessing,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        ObjectiveUnit.Items,
        mockPicker('id'),
        {} as any,
      );
      expect(component.setUnit).toHaveBeenCalledWith('0', {
        targetId: 'id',
        unit: ObjectiveUnit.Items,
      });
    });

    it('should auto-switch between items rate units', () => {
      spyOn(component, 'setUnit');
      component.changeUnit(
        Mocks.Objective1,
        ObjectiveUnit.Belts,
        {} as any,
        {} as any,
      );
      expect(component.setUnit).toHaveBeenCalledWith(Mocks.Objective1.id, {
        targetId: Mocks.Objective1.targetId,
        unit: ObjectiveUnit.Belts,
      });
    });
  });

  describe('convertItemsToMachines', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertItemsToMachines(
        Mocks.Objectives[0],
        RecipeId.AdvancedCircuit,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).toHaveBeenCalledWith('0', rational(1n, 77n));
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertItemsToMachines(
        Mocks.Objectives[2],
        RecipeId.AdvancedCircuit,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).not.toHaveBeenCalled();
    });
  });

  describe('convertMachinesToItems', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertMachinesToItems(
        Mocks.Objectives[4],
        ItemId.PiercingRoundsMagazine,
        ObjectiveUnit.Items,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).toHaveBeenCalledWith('4', rational(175n));
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertMachinesToItems(
        Mocks.Objectives[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).not.toHaveBeenCalled();
    });
  });

  describe('convertItemsToItems', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertItemsToItems(
        Mocks.Objectives[0],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Belts,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).toHaveBeenCalledWith('0', rational(1n, 900n));
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component, 'setValue');
      component.convertItemsToItems(
        Mocks.Objectives[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
        Mocks.AdjustedDataset,
      );
      expect(component.setValue).not.toHaveBeenCalled();
    });
  });

  describe('addItemObjective', () => {
    it('should use ObjectiveUnit.Items', () => {
      spyOn(component, 'addObjective');
      component.addItemObjective(ItemId.AdvancedCircuit);
      expect(component.addObjective).toHaveBeenCalledWith({
        targetId: ItemId.AdvancedCircuit,
        unit: ObjectiveUnit.Items,
      });
    });
  });

  describe('addRecipeObjective', () => {
    it('should use ObjectiveUnit.Machines', () => {
      spyOn(component, 'addObjective');
      component.addRecipeObjective(RecipeId.AdvancedCircuit);
      expect(component.addObjective).toHaveBeenCalledWith({
        targetId: RecipeId.AdvancedCircuit,
        unit: ObjectiveUnit.Machines,
      });
    });
  });

  describe('addRecipeLimit', () => {
    it('should use ObjectiveUnit.Machines and ObjectiveType.Limit', () => {
      spyOn(component, 'addObjective');
      component.addRecipeLimit(RecipeId.AdvancedCircuit);
      expect(component.addObjective).toHaveBeenCalledWith({
        targetId: RecipeId.AdvancedCircuit,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Limit,
      });
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('removeObjective', Objectives.remove);
    dispatch.props('setOrder', Objectives.setOrder);
    dispatch.props('setTarget', Objectives.setTarget);
    dispatch.props('setValue', Objectives.setValue);
    dispatch.props('setUnit', Objectives.setUnit);
    dispatch.props('setType', Objectives.setType);
    dispatch.props('addObjective', Objectives.add);
    dispatch.props('setDisplayRate', Settings.setDisplayRate);
    dispatch.props('setPaused', Preferences.setPaused);
  });
});
