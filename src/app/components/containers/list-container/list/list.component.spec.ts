import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { Mocks, TestUtility, ItemId, RecipeId } from 'src/tests';
import { IconComponent, SelectComponent } from '~/components';
import { DisplayRate, AllColumns, Rational } from '~/models';
import { RouterService } from '~/services/router.service';
import { reducers, metaReducers } from '~/store';
import { ListComponent } from './list.component';

@Component({
  selector: 'lab-test-list',
  template: `
    <lab-list
      [data]="data"
      [itemSettings]="itemSettings"
      [recipeSettings]="recipeSettings"
      [recipeRaw]="recipeRaw"
      [steps]="steps"
      [belt]="belt"
      [factoryRank]="factoryRank"
      [moduleRank]="moduleRank"
      [beaconModule]="beaconModule"
      [displayRate]="displayRate"
      [itemPrecision]="itemPrecision"
      [beltPrecision]="beltPrecision"
      [factoryPrecision]="factoryPrecision"
      [beaconCount]="beaconCount"
      [drillModule]="drillModule"
      [columns]="columns"
      [modifiedIgnore]="modifiedIgnore"
      [modifiedBelt]="modifiedBelt"
      [modifiedFactory]="modifiedFactory"
      [modifiedModules]="modifiedModules"
      [modifiedBeacons]="modifiedBeacons"
      (ignoreItem)="ignoreItem($event)"
      (setBelt)="setBelt($event)"
      (setFactory)="setFactory($event)"
      (setModules)="setModules($event)"
      (setBeaconModule)="setBeaconModule($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (showColumn)="showColumn($event)"
      (hideColumn)="hideColumn($event)"
      (resetItem)="resetItem($event)"
      (resetRecipe)="resetRecipe($event)"
      (resetIgnore)="resetIgnore()"
      (resetBelt)="resetBelt()"
      (resetFactory)="resetFactory()"
      (resetModules)="resetModules()"
      (resetBeacons)="resetBeacons()"
    >
    </lab-list>
  `,
})
class TestListComponent {
  @ViewChild(ListComponent) child: ListComponent;
  data = Mocks.Data;
  itemSettings = Mocks.ItemSettingsInitial;
  recipeSettings = Mocks.RecipeSettingsInitial;
  recipeRaw = Mocks.RecipeSettingsEntities;
  steps = Mocks.Steps;
  belt = ItemId.TransportBelt;
  factoryRank = [];
  moduleRank = [];
  beaconModule = ItemId.SpeedModule;
  displayRate = DisplayRate.PerMinute;
  itemPrecision = null;
  beltPrecision = 0;
  factoryPrecision = 1;
  beaconCount = 0;
  drillModule = false;
  columns = AllColumns;
  modifiedIgnore = false;
  modifiedBelt = false;
  modifiedFactory = false;
  modifiedModules = false;
  modifiedBeacons = false;
  ignoreItem(data) {}
  setBelt(data) {}
  setFactory(data) {}
  setModules(data) {}
  setBeaconModule(data) {}
  setBeaconCount(data) {}
  showColumn(data) {}
  hideColumn(data) {}
  resetItem(data) {}
  resetRecipe(data) {}
  resetIgnore() {}
  resetBelt() {}
  resetFactory() {}
  resetModules() {}
  resetBeacons() {}
}

describe('ListComponent', () => {
  let component: TestListComponent;
  let fixture: ComponentFixture<TestListComponent>;

  beforeEach(async(() => {
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
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
  });

  describe('power', () => {
    it('should return value in kW', () => {
      expect(component.child.power(Rational.one)).toEqual('1 kW');
    });

    it('should return a value in MW', () => {
      expect(component.child.power(Rational.thousand)).toEqual('1 MW');
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
      spyOn(component, 'setModules');
      TestUtility.clickSelector(fixture, '.list-edit-factory-module', 1);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setModules).toHaveBeenCalledWith({
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
      spyOn(component, 'setModules');
      TestUtility.clickSelector(fixture, '.list-edit-factory-module', 0);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setModules).toHaveBeenCalledWith({
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
      spyOn(component, 'setModules');
      component.child.factoryModuleChange(
        {
          recipeId: RecipeId.IronOre,
        } as any,
        ItemId.SpeedModule,
        0
      );
      expect(component.setModules).toHaveBeenCalledWith({
        id: ItemId.IronOre,
        value: [ItemId.SpeedModule, ItemId.SpeedModule, ItemId.SpeedModule],
        default: [ItemId.Module, ItemId.Module, ItemId.Module],
      });
    });
  });

  describe('beaconModuleChange', () => {
    it('should set the beacon module', () => {
      spyOn(component, 'setBeaconModule');
      TestUtility.clickSelector(fixture, '.list-edit-beacon-module', 0);
      fixture.detectChanges();
      TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
      fixture.detectChanges();
      expect(component.setBeaconModule).toHaveBeenCalledWith({
        id: Mocks.Step1.recipeId,
        value: ItemId.SpeedModule,
        default: component.beaconModule,
      });
    });

    it('should get correct default when ignoring mining modules', () => {
      spyOn(component, 'setBeaconModule');
      component.child.beaconModuleChange(
        {
          recipeId: RecipeId.IronOre,
        } as any,
        ItemId.SpeedModule
      );
      expect(component.setBeaconModule).toHaveBeenCalledWith({
        id: ItemId.IronOre,
        value: ItemId.SpeedModule,
        default: ItemId.Module,
      });
    });
  });

  describe('beaconCountChange', () => {
    it('should set beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.selectSelector(fixture, 'input', '24');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: 24,
        default: 0,
      });
    });

    it('should not set beacon count on invalid event', () => {
      spyOn(component, 'setBeaconCount');
      const event = { target: {} };
      component.child.beaconCountChange(Mocks.Step1.itemId as any, event);
      expect(component.setBeaconCount).not.toHaveBeenCalled();
    });

    it('should not set beacon count if unchanged', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.selectSelector(fixture, 'input', '16');
      fixture.detectChanges();
      expect(component.setBeaconCount).not.toHaveBeenCalled();
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
});
