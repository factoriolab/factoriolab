import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { IconComponent, SelectComponent } from '~/components';
import { DisplayRate } from '~/models';
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
      [beaconCount]="beaconCount"
      [displayRate]="displayRate"
      [itemPrecision]="itemPrecision"
      [beltPrecision]="beltPrecision"
      [factoryPrecision]="factoryPrecision"
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
  beaconCount = 0;
  displayRate = DisplayRate.PerMinute;
  itemPrecision = null;
  beltPrecision = 0;
  factoryPrecision = 1;
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

  it('should reset a step', () => {
    spyOn(component, 'resetItem');
    spyOn(component, 'resetRecipe');
    TestUtility.clickSelector(fixture, '.list-step-reset', 0);
    fixture.detectChanges();
    expect(component.resetItem).toHaveBeenCalled();
    expect(component.resetRecipe).toHaveBeenCalled();
  });

  describe('findStep', () => {
    it('should find the step with the passed item id', () => {
      const result = component.child.findStep(Mocks.Steps[0].itemId);
      expect(result).toEqual(Mocks.Steps[0]);
    });
  });
});
