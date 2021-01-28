import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { Mocks, TestUtility, ItemId, RecipeId } from 'src/tests';
import { IconComponent, SelectComponent, ColumnsComponent } from '~/components';
import {
  DisplayRate,
  Rational,
  Step,
  ListMode,
  InserterTarget,
  InserterCapacity,
  Column,
} from '~/models';
import { RouterService } from '~/services';
import { reducers, metaReducers } from '~/store';
import { ColumnsState, initialColumnsState } from '~/store/preferences';
import { ExportUtility } from '~/utilities';
import { ListComponent, StepDetailTab } from './list.component';

enum DataTest {
  Export = 'lab-list-export',
  Beacons = 'lab-list-beacons',
  ResetStep = 'lab-list-reset-step',
}

@Component({
  selector: 'lab-test-list',
  template: `
    <lab-list
      [mode]="mode"
      [selected]="selected"
      [data]="data"
      [itemSettings]="itemSettings"
      [itemRaw]="itemRaw"
      [recipeSettings]="recipeSettings"
      [recipeRaw]="recipeRaw"
      [settings]="settings"
      [factories]="factories"
      [beltSpeed]="beltSpeed"
      [steps]="steps"
      [disabledRecipes]="disabledRecipes"
      [displayRate]="displayRate"
      [inserterTarget]="inserterTarget"
      [inserterCapacity]="inserterCapacity"
      [columns]="columns"
      [modifiedIgnore]="modifiedIgnore"
      [modifiedBelt]="modifiedBelt"
      [modifiedFactory]="modifiedFactory"
      [modifiedBeacons]="modifiedBeacons"
      (ignoreItem)="ignoreItem($event)"
      (setBelt)="setBelt($event)"
      (setWagon)="setWagon($event)"
      (setFactory)="setFactory($event)"
      (setFactoryModules)="setFactoryModules($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (setBeacon)="setBeacon($event)"
      (setBeaconModules)="setBeaconModules($event)"
      (setColumns)="setColumns($event)"
      (setPrecision)="setPrecision($event)"
      (resetItem)="resetItem($event)"
      (resetRecipe)="resetRecipe($event)"
      (resetIgnore)="resetIgnore()"
      (resetBelt)="resetBelt()"
      (resetWagon)="resetWagon()"
      (resetFactory)="resetFactory()"
      (resetBeacons)="resetBeacons()"
      (setDisabledRecipes)="setDisabledRecipes($event)"
    >
    </lab-list>
  `,
})
class TestListComponent {
  @ViewChild(ListComponent) child: ListComponent;
  mode = ListMode.All;
  selected = null;
  data = Mocks.Data;
  itemSettings = Mocks.ItemSettingsInitial;
  itemRaw = Mocks.RecipeSettingsEntities;
  recipeSettings = Mocks.RecipeSettingsInitial;
  recipeRaw = Mocks.RecipeSettingsEntities;
  settings = Mocks.SettingsState1;
  factories = Mocks.FactorySettingsInitial;
  beltSpeed = Mocks.BeltSpeed;
  steps = Mocks.Steps;
  disabledRecipes = [];
  displayRate = DisplayRate.PerMinute;
  inserterTarget = InserterTarget.Chest;
  inserterCapacity = InserterCapacity.Capacity0;
  columns = initialColumnsState;
  modifiedIgnore = false;
  modifiedBelt = false;
  modifiedFactory = false;
  modifiedBeacons = false;
  ignoreItem(data): void {}
  setBelt(data): void {}
  setWagon(data): void {}
  setFactory(data): void {}
  setFactoryModules(data): void {}
  setBeaconCount(data): void {}
  setBeacon(data): void {}
  setBeaconModules(data): void {}
  setColumns(data): void {}
  setPrecision(data): void {}
  resetItem(data): void {}
  resetRecipe(data): void {}
  resetIgnore(): void {}
  resetBelt(): void {}
  resetWagon(): void {}
  resetFactory(): void {}
  resetBeacons(): void {}
  setDisabledRecipes(data): void {}
}

describe('ListComponent', () => {
  let component: TestListComponent;
  let fixture: ComponentFixture<TestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ColumnsComponent,
        IconComponent,
        SelectComponent,
        ListComponent,
        TestListComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      providers: [RouterService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('columns', () => {
    it('should set the totalspan', () => {
      expect(component.child.totalSpan).toEqual(10);
    });

    it('should set totalspan with no columns', () => {
      component.columns = Object.keys(component.columns).reduce(
        (e: ColumnsState, c) => {
          e[c] = { show: false, precision: 1 };
          return e;
        },
        {}
      );
      fixture.detectChanges();
      expect(component.child.totalSpan).toEqual(2);
    });
  });

  describe('mode', () => {
    it('should call setDisplayedSteps when changed', () => {
      spyOn(component.child, 'setDisplayedSteps');
      component.mode = null;
      fixture.detectChanges();
      expect(component.child.setDisplayedSteps).toHaveBeenCalled();
    });
  });

  describe('selected', () => {
    it('should get the selected value', () => {
      expect(component.child.selected).toBeNull();
    });

    it('should call setDisplayedSteps when changed', () => {
      spyOn(component.child, 'setDisplayedSteps');
      component.selected = 'id';
      fixture.detectChanges();
      expect(component.child.setDisplayedSteps).toHaveBeenCalled();
    });
  });

  describe('rateLabel', () => {
    it('should handle per hour', () => {
      component.displayRate = DisplayRate.PerHour;
      fixture.detectChanges();
      expect(component.child.rateLabel).toEqual('/h');
    });

    it('should handle per minute', () => {
      component.displayRate = DisplayRate.PerMinute;
      fixture.detectChanges();
      expect(component.child.rateLabel).toEqual('/m');
    });

    it('should handle per second', () => {
      component.displayRate = DisplayRate.PerSecond;
      fixture.detectChanges();
      expect(component.child.rateLabel).toEqual('/s');
    });

    it('should handle invalid value', () => {
      component.displayRate = 'test' as any;
      fixture.detectChanges();
      expect(component.child.rateLabel).toEqual('');
    });
  });

  describe('totalPower', () => {
    it('should sum the total power from steps', () => {
      expect(component.child.totalPower).toEqual('1 kW');
    });
  });

  describe('totalPollution', () => {
    it('should sum the total pollution from steps', () => {
      expect(component.child.totalPollution).toEqual('1');
    });
  });

  describe('setEffectivePrecision', () => {
    it('should wait until both steps and columns are defined', () => {
      component.child._columns = null;
      component.child.effPrecision = null;
      component.child.setEffectivePrecision();
      expect(component.child.effPrecision).toBeNull();
    });

    it('should set up the effective precision mapping', () => {
      component.child.effPrecision = null;
      component.child.setEffectivePrecision();
      expect(component.child.effPrecision).toEqual({
        [Column.Surplus]: 0,
        [Column.Items]: 0,
        [Column.Belts]: 1,
        [Column.Wagons]: 0,
        [Column.Factories]: 0,
        [Column.Power]: 0,
        [Column.Pollution]: 0,
      });
    });
  });

  describe('effPrecFrom', () => {
    it('should return null if precision is null', () => {
      expect(component.child.effPrecFrom(null, null)).toEqual(null);
    });

    it('should return precision if any step has higher number of decimals', () => {
      expect(component.child.effPrecFrom(0, (s: Step) => s.belts)).toEqual(0);
    });

    it('should return max number of decimals if less than precision', () => {
      expect(component.child.effPrecFrom(5, (s: Step) => s.belts)).toEqual(1);
    });
  });

  describe('setDetailTabs', () => {
    it('should include no tabs', () => {
      component.steps = [{ itemId: ItemId.CopperPlate, items: Rational.one }];
      fixture.detectChanges();
      expect(component.child.details[ItemId.CopperPlate]).toEqual([]);
    });

    it('should include all tabs', () => {
      component.steps = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.one,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.details[ItemId.PetroleumGas]).toEqual([
        StepDetailTab.Inputs,
        StepDetailTab.Outputs,
        StepDetailTab.Factory,
        StepDetailTab.Recipes,
      ]);
      expect(component.child.recipes[ItemId.PetroleumGas].length).toEqual(4);
    });

    it('should keep an expanded step that is still valid', () => {
      component.child.expanded[ItemId.PetroleumGas] = StepDetailTab.Inputs;
      component.steps = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.one,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.expanded[ItemId.PetroleumGas]).toEqual(
        StepDetailTab.Inputs
      );
    });

    it('should collapse an expanded step that can no longer be expanded', () => {
      component.child.expanded[ItemId.CopperPlate] = StepDetailTab.Inputs;
      component.steps = [{ itemId: ItemId.CopperPlate, items: Rational.one }];
      fixture.detectChanges();
      expect(component.child.expanded[ItemId.CopperPlate]).toBeUndefined();
    });

    it('should collapse an expanded step that no longer exists', () => {
      component.child.expanded[ItemId.CopperCable] = StepDetailTab.Inputs;
      component.steps = [{ itemId: ItemId.CopperPlate, items: Rational.one }];
      fixture.detectChanges();
      expect(component.child.expanded[ItemId.CopperCable]).toBeUndefined();
    });

    it('should select a new detail tab when possible', () => {
      component.child.expanded[ItemId.PetroleumGas] = -1 as any;
      component.steps = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.one,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.expanded[ItemId.PetroleumGas]).toEqual(
        StepDetailTab.Inputs
      );
    });
  });

  describe('setDisplayedSteps', () => {
    it('should set displayed steps to the full list', () => {
      expect(component.child.displayedSteps).toEqual(Mocks.Steps);
    });

    it('should set displayed steps to selected step', () => {
      component.mode = ListMode.Focus;
      component.selected = Mocks.Step1.itemId;
      fixture.detectChanges();
      expect(component.child.displayedSteps).toEqual([Mocks.Step1]);
      expect(component.child.expanded).toEqual({
        [Mocks.Step1.itemId]: StepDetailTab.Inputs,
      });
    });

    it('should set displayed steps and expanded to empty if nothing is selected', () => {
      component.mode = ListMode.Focus;
      fixture.detectChanges();
      expect(component.child.displayedSteps).toEqual([]);
      expect(component.child.expanded).toEqual({});
    });
  });

  describe('trackBy', () => {
    it('should combine the step item and recipe ids', () => {
      expect(component.child.trackBy(Mocks.Step1)).toEqual(
        `${Mocks.Step1.itemId}.${Mocks.Step1.recipeId}`
      );
    });
  });

  describe('findStep', () => {
    it('should find the step with a specific item id', () => {
      expect(component.child.findStep(Mocks.Step1.itemId)).toEqual(Mocks.Step1);
    });
  });

  describe('sortKeyValue', () => {
    it('should sort KeyValue objects', () => {
      expect(
        component.child.sortKeyValue(
          { key: 'a', value: Rational.zero },
          { key: 'b', value: Rational.one }
        )
      ).toEqual(1);
    });
  });

  describe('factoryRate', () => {
    it('should return the normal rate for standard factories', () => {
      expect(
        component.child.factoryRate(
          new Rational(BigInt(1), BigInt(3)),
          3,
          ItemId.AssemblingMachine1
        )
      ).toEqual('0.334');
    });

    it('should convert to percentage for pumpjacks', () => {
      expect(
        component.child.factoryRate(
          new Rational(BigInt(1), BigInt(3)),
          3,
          ItemId.Pumpjack
        )
      ).toEqual('33.34%');
    });
  });

  describe('rate', () => {
    it('should return a correct fraction', () => {
      expect(
        component.child.rate(Rational.one.div(Rational.two), null)
      ).toEqual('1/2');
    });

    it('should return a correct percentage', () => {
      expect(component.child.rate(Rational.one, -2)).toEqual('100');
    });

    it('should return a value to correct precision', () => {
      expect(
        component.child.rate(new Rational(BigInt(1), BigInt(3)), 3)
      ).toEqual('0.334');
    });

    it('should add necessary zeros', () => {
      expect(component.child.rate(Rational.fromNumber(0.99), 3)).toEqual(
        '0.990'
      );
    });

    it('should add necessary spaces', () => {
      expect(component.child.rate(Rational.one, 3)).toEqual('1    ');
    });

    it('should add necessary zeros to rounded value', () => {
      expect(component.child.rate(Rational.fromNumber(0.99), 1)).toEqual('1.0');
    });
  });

  describe('power', () => {
    it('should return value in kW', () => {
      expect(component.child.power(Rational.one)).toEqual('1 kW');
    });

    it('should return a value in MW', () => {
      expect(component.child.power(Rational.thousand)).toEqual('1 MW');
    });
  });

  describe('leftPad', () => {
    it('should pad the left side of a percent value', () => {
      expect(component.child.leftPad('10')).toEqual('  10');
    });
  });

  describe('inserter', () => {
    it('should calculate the number and type of inserters required', () => {
      expect(component.child.inserter(Rational.one)).toEqual({
        id: ItemId.LongHandedInserter,
        value: Rational.from(5, 6),
      });
    });
  });

  describe('getSettings', () => {
    it('should get the factory settings for a step', () => {
      expect(component.child.getSettings(Mocks.Step1)).toEqual(
        component.factories.entities[
          component.recipeSettings[Mocks.Step1.recipeId].factory
        ]
      );
    });
  });

  describe('factoryChange', () => {
    it('should set a factory', () => {
      spyOn(component, 'setFactory');
      component.child.factoryChange(Mocks.Step1, ItemId.AssemblingMachine1);
      expect(component.setFactory).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: ItemId.AssemblingMachine1,
        default: ItemId.AssemblingMachine3,
      });
    });
  });

  describe('factoryModuleChange', () => {
    it('should set factory modules', () => {
      spyOn(component, 'setFactoryModules');
      component.child.factoryModuleChange(Mocks.Step1, ItemId.SpeedModule, 0);
      expect(component.setFactoryModules).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: new Array(4).fill(ItemId.SpeedModule),
        default: new Array(4).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('beaconModuleChange', () => {
    it('should beacon modules', () => {
      spyOn(component, 'setBeaconModules');
      component.child.beaconModuleChange(Mocks.Step1, ItemId.SpeedModule, 0);
      expect(component.setBeaconModules).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: new Array(2).fill(ItemId.SpeedModule),
        default: new Array(2).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('generateModules', () => {
    it('should fill when index 0 is modified', () => {
      expect(
        component.child.generateModules(
          0,
          ItemId.SpeedModule,
          new Array(2).fill(ItemId.Module)
        )
      ).toEqual(new Array(2).fill(ItemId.SpeedModule));
    });

    it('should modify a specific index', () => {
      expect(
        component.child.generateModules(
          1,
          ItemId.SpeedModule,
          new Array(2).fill(ItemId.Module)
        )
      ).toEqual([ItemId.Module, ItemId.SpeedModule]);
    });
  });

  describe('beaconCountChange', () => {
    it('should set beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.setTextDt(fixture, DataTest.Beacons, '12');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: 12,
        default: 8,
      });
    });

    it('should not set beacon count on invalid event', () => {
      spyOn(component, 'setBeaconCount');
      const event: any = { target: {} };
      component.child.beaconCountChange(Mocks.Step1.itemId as any, event);
      expect(component.setBeaconCount).not.toHaveBeenCalled();
    });

    it('should not set beacon count if unchanged', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.setTextDt(fixture, DataTest.Beacons, '8');
      fixture.detectChanges();
      expect(component.setBeaconCount).not.toHaveBeenCalled();
    });
  });

  describe('resetStep', () => {
    it('should reset a step', () => {
      spyOn(component, 'resetItem');
      spyOn(component, 'resetRecipe');
      TestUtility.clickDt(fixture, DataTest.ResetStep);
      fixture.detectChanges();
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should call the export utility', () => {
      spyOn(ExportUtility, 'stepsToCsv');
      TestUtility.clickDt(fixture, DataTest.Export);
      fixture.detectChanges();
      expect(ExportUtility.stepsToCsv).toHaveBeenCalled();
    });
  });

  describe('toggleRecipe', () => {
    it('should enable a recipe', () => {
      spyOn(component, 'setDisabledRecipes');
      component.disabledRecipes = [RecipeId.AdvancedOilProcessing];
      fixture.detectChanges();
      component.child.toggleRecipe(RecipeId.AdvancedOilProcessing);
      expect(component.setDisabledRecipes).toHaveBeenCalledWith({
        value: [],
        default: [RecipeId.NuclearFuelReprocessing],
      });
    });

    it('should disable a recipe', () => {
      spyOn(component, 'setDisabledRecipes');
      fixture.detectChanges();
      component.child.toggleRecipe(RecipeId.AdvancedOilProcessing);
      expect(component.setDisabledRecipes).toHaveBeenCalledWith({
        value: [RecipeId.AdvancedOilProcessing],
        default: [RecipeId.NuclearFuelReprocessing],
      });
    });
  });
});
