import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from 'primeng/api';
import { Subject } from 'rxjs';

import { spread } from '~/helpers';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { SimplexResultType } from '~/models/enum/simplex-result-type';
import { ObjectiveState } from '~/models/objective';
import { rational } from '~/models/rational';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ObjectivesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectivesComponent);
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
          Mocks.settingsStateInitial,
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
          Mocks.settingsStateInitial,
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
          Mocks.settingsStateInitial,
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
          Mocks.settingsStateInitial,
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
          spread(Mocks.settingsStateInitial, {
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
          spread(Mocks.settingsStateInitial, {
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
          Mocks.settingsStateInitial,
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
          Mocks.settingsStateInitial,
        )
        .subscribe((r) => (result = r));
      expect(result[0].summary).toEqual('objectives.errorInfeasible');
    });
  });

  describe('changeUnit', () => {
    const mockPicker = (id: string): any => {
      const picker = {
        selectId: new Subject<string>(),
        clickOpen: (): void => {},
      };
      picker.clickOpen = (): void => {
        picker.selectId.next(id);
      };
      return picker;
    };

    it('should do nothing if it cannot find a matching objective rational', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      component.changeUnit(
        Mocks.objective5,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.objectivesSvc.updateEntity).not.toHaveBeenCalled();
    });

    it('should do nothing if switching to and from machines', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      component.changeUnit(
        Mocks.objective5,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.objectivesSvc.updateEntity).not.toHaveBeenCalled();
    });

    it('should auto-switch from item to recipe', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      component.changeUnit(
        Mocks.objective1,
        ObjectiveUnit.Machines,
        {} as any,
        {} as any,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith(
        Mocks.objective1.id,
        {
          targetId: RecipeId.AdvancedCircuit,
          unit: ObjectiveUnit.Machines,
        },
      );
    });

    it('should prompt user to switch from item to recipe', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      const objective: ObjectiveState = {
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
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith('0', {
        targetId: RecipeId.AdvancedOilProcessing,
        unit: ObjectiveUnit.Machines,
      });
    });

    it('should auto-switch from recipe to item', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      component.changeUnit(
        Mocks.objective5,
        ObjectiveUnit.Items,
        {} as any,
        {} as any,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith(
        Mocks.objective5.id,
        {
          targetId: ItemId.PiercingRoundsMagazine,
          unit: ObjectiveUnit.Items,
        },
      );
    });

    it('should prompt user to switch from recipe to item', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
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
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith('0', {
        targetId: 'id',
        unit: ObjectiveUnit.Items,
      });
    });

    it('should auto-switch between items rate units', () => {
      spyOn(component.objectivesSvc, 'updateEntity');
      component.changeUnit(
        Mocks.objective1,
        ObjectiveUnit.Belts,
        {} as any,
        {} as any,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith(
        Mocks.objective1.id,
        {
          targetId: Mocks.objective1.targetId,
          unit: ObjectiveUnit.Belts,
        },
      );
    });
  });

  describe('convertItemsToMachines', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertItemsToMachines(
        Mocks.objectives[0],
        RecipeId.AdvancedCircuit,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith('1', {
        value: rational(1n, 77n),
      });
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertItemsToMachines(
        Mocks.objectives[2],
        RecipeId.AdvancedCircuit,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('convertMachinesToItems', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertMachinesToItems(
        Mocks.objectives[4],
        ItemId.PiercingRoundsMagazine,
        ObjectiveUnit.Items,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith('5', {
        value: rational(175n),
      });
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertMachinesToItems(
        Mocks.objectives[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('convertItemsToItems', () => {
    it('should convert the objective value', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertItemsToItems(
        Mocks.objectives[0],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Belts,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledWith('1', {
        value: rational(1n, 2700n),
      });
    });

    it('should not convert the value on maximize objectives', () => {
      spyOn(component, 'convertObjectiveValues').and.returnValue(true);
      spyOn(component.objectivesSvc, 'updateEntity');
      component.convertItemsToItems(
        Mocks.objectives[2],
        ItemId.AdvancedCircuit,
        ObjectiveUnit.Items,
        Mocks.adjustedDataset,
      );
      expect(component.objectivesSvc.updateEntity).toHaveBeenCalledTimes(1);
    });
  });
});
