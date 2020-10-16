import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { Mocks, TestUtility, ItemId, RecipeId, ElementId } from 'src/tests';
import { IconComponent, SelectComponent } from '~/components';
import {
  DisplayRate,
  AllColumns,
  Rational,
  Step,
  ListMode,
  InserterTarget,
  InserterCapacity,
} from '~/models';
import { RouterService } from '~/services/router.service';
import { reducers, metaReducers } from '~/store';
import { ExportUtility } from '~/utilities';
import { ListComponent, StepDetailTab } from './list.component';

@Component({
  selector: 'lab-test-list',
  template: `
    <lab-list
      [mode]="mode"
      [data]="data"
      [itemSettings]="itemSettings"
      [recipeSettings]="recipeSettings"
      [recipeRaw]="recipeRaw"
      [steps]="steps"
      [beltSpeed]="beltSpeed"
      [factoryRank]="factoryRank"
      [moduleRank]="moduleRank"
      [beaconModule]="beaconModule"
      [displayRate]="displayRate"
      [itemPrecision]="itemPrecision"
      [beltPrecision]="beltPrecision"
      [wagonPrecision]="wagonPrecision"
      [factoryPrecision]="factoryPrecision"
      [powerPrecision]="powerPrecision"
      [pollutionPrecision]="pollutionPrecision"
      [beaconCount]="beaconCount"
      [drillModule]="drillModule"
      [inserterTarget]="inserterTarget"
      [inserterCapacity]="inserterCapacity"
      [columns]="columns"
      [modifiedIgnore]="modifiedIgnore"
      [modifiedBelt]="modifiedBelt"
      [modifiedFactory]="modifiedFactory"
      [modifiedBeacons]="modifiedBeacons"
      [selected]="selected"
      (ignoreItem)="ignoreItem($event)"
      (setBelt)="setBelt($event)"
      (setFactory)="setFactory($event)"
      (setFactoryModules)="setFactoryModules($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (setBeacon)="setBeacon($event)"
      (setBeaconModules)="setBeaconModules($event)"
      (showColumn)="showColumn($event)"
      (hideColumn)="hideColumn($event)"
      (resetItem)="resetItem($event)"
      (resetRecipe)="resetRecipe($event)"
      (resetIgnore)="resetIgnore()"
      (resetBelt)="resetBelt()"
      (resetFactory)="resetFactory()"
      (resetBeacons)="resetBeacons()"
    >
    </lab-list>
  `,
})
class TestListComponent {
  @ViewChild(ListComponent) child: ListComponent;
  mode = ListMode.All;
  data = Mocks.Data;
  itemSettings = Mocks.ItemSettingsInitial;
  recipeSettings = Mocks.RecipeSettingsInitial;
  recipeRaw = Mocks.RecipeSettingsEntities;
  steps = Mocks.Steps;
  beltSpeed = Mocks.BeltSpeed;
  factoryRank = [];
  moduleRank = [];
  beaconModule = ItemId.SpeedModule;
  displayRate = DisplayRate.PerMinute;
  itemPrecision = null;
  beltPrecision = 0;
  wagonPrecision = 1;
  factoryPrecision = 2;
  powerPrecision = 3;
  pollutionPrecision = 4;
  beaconCount = 0;
  drillModule = false;
  columns = AllColumns;
  inserterTarget = InserterTarget.Chest;
  inserterCapacity = InserterCapacity.Capacity0;
  modifiedIgnore = false;
  modifiedBelt = false;
  modifiedFactory = false;
  modifiedBeacons = false;
  selected = null;
  ignoreItem(data) {}
  setBelt(data) {}
  setFactory(data) {}
  setFactoryModules(data) {}
  setBeaconCount(data) {}
  setBeacon(data) {}
  setBeaconModules(data) {}
  showColumn(data) {}
  hideColumn(data) {}
  resetItem(data) {}
  resetRecipe(data) {}
  resetIgnore() {}
  resetBelt() {}
  resetFactory() {}
  resetBeacons() {}
}

describe('ListComponent', () => {
  let component: TestListComponent;
  let fixture: ComponentFixture<TestListComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
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
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

  describe('columns', () => {
    it('should get the list', () => {
      expect(component.child.columns).toEqual(AllColumns);
    });

    it('should set the the show entities', () => {
      for (const c of AllColumns) {
        expect(component.child.show[c]).toBeTrue();
      }
    });

    it('should set the totalspan', () => {
      expect(component.child.totalSpan).toEqual(10);
    });

    it('should set totalspan with no columns', () => {
      component.columns = [];
      fixture.detectChanges();
      expect(component.child.totalSpan).toEqual(2);
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

  describe('setItemPrecision', () => {
    it('should set the effective items and surplus precision', () => {
      expect(component.child.effPrecSurplus).toEqual(null);
      expect(component.child.effPrecItems).toEqual(null);
    });
  });

  describe('setBeltsPrecision', () => {
    it('should set the effective belts precision', () => {
      expect(component.child.effPrecBelts).toEqual(0);
    });
  });

  describe('setWagonsPrecision', () => {
    it('should set the effective wagons precision', () => {
      expect(component.child.effPrecWagons).toEqual(0);
    });
  });

  describe('setFactoriesPrecision', () => {
    it('should set the effective factories precision', () => {
      expect(component.child.effPrecFactories).toEqual(0);
    });
  });

  describe('setPowerPrecision', () => {
    it('should set the effective power precision', () => {
      expect(component.child.effPrecPower).toEqual(0);
    });
  });

  describe('setPollutionPrecision', () => {
    it('should set the effective pollution precision', () => {
      expect(component.child.effPrecPollution).toEqual(0);
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
      component.steps = [
        { itemId: ItemId.CopperPlate, items: Rational.one, depth: 0 },
      ];
      fixture.detectChanges();
      expect(component.child.details[ItemId.CopperPlate]).toEqual([]);
    });

    it('should include all tabs', () => {
      component.steps = [
        {
          itemId: ItemId.CopperCable,
          recipeId: RecipeId.CopperCable,
          items: Rational.one,
          depth: 0,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.details[ItemId.CopperCable]).toEqual([
        StepDetailTab.Inputs,
        StepDetailTab.Outputs,
        StepDetailTab.Factory,
      ]);
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

  describe('miningIgnoreModule', () => {
    it('should return true for mining drill step', () => {
      expect(
        component.child.miningIgnoreModule({
          recipeId: RecipeId.IronOre,
        } as any)
      ).toBeTrue();
    });

    it('should return false if drillModule is true', () => {
      component.drillModule = true;
      fixture.detectChanges();
      expect(
        component.child.miningIgnoreModule({
          recipeId: RecipeId.IronOre,
        } as any)
      ).toBeFalse();
    });

    it('should return false if factory not found', () => {
      expect(
        component.child.miningIgnoreModule({
          recipeId: 'test',
        } as any)
      ).toBeFalse();
    });
  });

  describe('factoryChange', () => {
    it('should set a factory', () => {
      spyOn(component, 'setFactory');
      TestUtility.clickSelector(fixture, '.list-edit-factory', 0);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 0);
      fixture.detectChanges();
      expect(component.setFactory).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: ItemId.AssemblingMachine1,
        default: ItemId.AssemblingMachine1,
      });
    });
  });

  describe('factoryModuleChange', () => {
    it('should set a specific factory module', () => {
      spyOn(component, 'setFactoryModules');
      TestUtility.clickSelector(fixture, '.list-edit-factory-module', 1);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setFactoryModules).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: [
          ItemId.SpeedModule3,
          ItemId.SpeedModule,
          ItemId.SpeedModule3,
          ItemId.SpeedModule3,
        ],
        default: [ItemId.Module, ItemId.Module, ItemId.Module, ItemId.Module],
      });
    });

    it('should set all factory modules', () => {
      spyOn(component, 'setFactoryModules');
      TestUtility.clickSelector(fixture, '.list-edit-factory-module', 0);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setFactoryModules).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: [
          ItemId.SpeedModule,
          ItemId.SpeedModule,
          ItemId.SpeedModule,
          ItemId.SpeedModule,
        ],
        default: [ItemId.Module, ItemId.Module, ItemId.Module, ItemId.Module],
      });
    });

    it('should get correct default when ignoring mining modules', () => {
      spyOn(component, 'setFactoryModules');
      component.child.factoryModuleChange(
        {
          recipeId: RecipeId.IronOre,
        } as any,
        ItemId.SpeedModule,
        0
      );
      expect(component.setFactoryModules).toHaveBeenCalledWith({
        id: ItemId.IronOre,
        value: [ItemId.SpeedModule, ItemId.SpeedModule, ItemId.SpeedModule],
        default: [ItemId.Module, ItemId.Module, ItemId.Module],
      });
    });
  });

  describe('beaconModuleChange', () => {
    it('should set the beacon module', () => {
      spyOn(component, 'setBeaconModules');
      TestUtility.clickSelector(fixture, '.list-edit-beacon-module', 0);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setBeaconModules).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: [ItemId.SpeedModule, ItemId.SpeedModule],
        default: [ItemId.SpeedModule, ItemId.SpeedModule],
      });
    });
  });

  describe('beaconCountChange', () => {
    it('should set beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.selectSelector(fixture, 'input', '12');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: 12,
        default: 0,
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
      TestUtility.selectSelector(fixture, 'input', '8');
      fixture.detectChanges();
      expect(component.setBeaconCount).not.toHaveBeenCalled();
    });

    it('should get correct default when ignoring mining modules', () => {
      spyOn(component, 'setBeaconCount');
      spyOn(component.child, 'miningIgnoreModule').and.returnValue(true);
      TestUtility.selectSelector(fixture, 'input', '12');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: 12,
        default: 0,
      });
    });
  });

  describe('resetStep', () => {
    it('should reset a step', () => {
      spyOn(component, 'resetItem');
      spyOn(component, 'resetRecipe');
      TestUtility.clickSelector(fixture, '.list-step-reset', 0);
      fixture.detectChanges();
      expect(component.resetItem).toHaveBeenCalled();
      expect(component.resetRecipe).toHaveBeenCalled();
    });
  });

  describe('export', () => {
    it('should call the export utility', () => {
      spyOn(ExportUtility, 'stepsToCsv');
      TestUtility.clickId(fixture, ElementId.ListSaveCsv);
      fixture.detectChanges();
      expect(ExportUtility.stepsToCsv).toHaveBeenCalled();
    });
  });
});
