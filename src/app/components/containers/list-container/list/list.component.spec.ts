import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';

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
  let route: ActivatedRoute;
  let router: RouterService;
  let detectChanges: jasmine.Spy;

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
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      providers: [RouterService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestListComponent);
    route = TestBed.inject(ActivatedRoute);
    router = TestBed.inject(RouterService);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('steps', () => {
    it('should set href and id', fakeAsync(() => {
      spyOn(router, 'requestHash').and.returnValue(of(Mocks.Hash));
      spyOn(router, 'stepHref').and.returnValue('test');
      component.steps = [{}] as any;
      fixture.detectChanges();
      tick();
      expect(component.child.steps[0].id).toEqual('.');
      expect(component.child.steps[0].href).toEqual('test');
    }));
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

  describe('ngOnInit', () => {
    afterEach(() => {
      history.replaceState(null, null, '');
    });

    it('should save the fragment', () => {
      route.fragment = of('test');
      component.child.ngOnInit();
      expect(component.child.fragment).toEqual('test');
    });
  });

  describe('ngAfterViewInit', () => {
    it('should do nothing if there is no fragment', () => {
      spyOn(document, 'querySelector');
      component.child.ngAfterViewInit();
      expect(document.querySelector).not.toHaveBeenCalled();
    });

    it('should expand the step if a match is found', () => {
      const element: any = { scrollIntoView: (): void => {} };
      spyOn(element, 'scrollIntoView');
      spyOn(document, 'querySelector').and.returnValue(element);

      component.child.fragment = Mocks.Steps[0].itemId;
      component.child.ngAfterViewInit();
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(component.child.expanded[component.child.steps[0].id]).toEqual(
        StepDetailTab.Item
      );
      expect(detectChanges).toHaveBeenCalled();
    });

    it('should skip if no match is found', () => {
      const element: any = { scrollIntoView: (): void => {} };
      spyOn(element, 'scrollIntoView');
      spyOn(document, 'querySelector').and.returnValue(element);
      component.child.steps.push({
        itemId: null,
        items: null,
        recipeId: 'test',
      });
      component.child.fragment = 'test';
      component.child.ngAfterViewInit();
      expect(element.scrollIntoView).toHaveBeenCalled();
      expect(detectChanges).not.toHaveBeenCalled();
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
    const id = `${ItemId.PetroleumGas}.${RecipeId.AdvancedOilProcessing}`;
    const id2 = '.';

    it('should include no tabs', () => {
      component.steps = [{ itemId: null, items: null }];
      fixture.detectChanges();
      expect(component.child.details[id2]).toEqual([]);
    });

    it('should include all tabs', () => {
      component.steps = [
        {
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.one,
          parents: {},
          outputs: { [ItemId.PetroleumGas]: Rational.from(1, 2) },
          factories: Rational.one,
        },
        {
          itemId: null,
          items: null,
          recipeId: RecipeId.CoalLiquefaction,
          outputs: { [ItemId.PetroleumGas]: Rational.from(1, 2) },
        },
      ];
      fixture.detectChanges();
      expect(component.child.details[id]).toEqual([
        StepDetailTab.Item,
        StepDetailTab.Recipe,
        StepDetailTab.Factory,
        StepDetailTab.Recipes,
      ]);
      expect(component.child.outputs[id].length).toEqual(2);
      expect(component.child.recipes[id].length).toEqual(4);
    });

    it('should keep an expanded step that is still valid', () => {
      component.child.expanded[id] = StepDetailTab.Item;
      component.steps = [
        {
          id,
          itemId: ItemId.PetroleumGas,
          recipeId: RecipeId.AdvancedOilProcessing,
          items: Rational.one,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.expanded[id]).toEqual(StepDetailTab.Item);
    });

    it('should collapse an expanded step that can no longer be expanded', () => {
      component.child.expanded[id2] = StepDetailTab.Item;
      component.steps = [{ itemId: null, items: null }];
      fixture.detectChanges();
      expect(component.child.expanded[id2]).toBeUndefined();
    });

    it('should collapse an expanded step that no longer exists', () => {
      const i = 'id';
      component.child.expanded[i] = StepDetailTab.Item;
      component.steps = [{ itemId: ItemId.CopperPlate, items: Rational.one }];
      fixture.detectChanges();
      expect(component.child.expanded[i]).toBeUndefined();
    });

    it('should select a new detail tab when possible', () => {
      component.child.expanded[id] = -1 as any;
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
      expect(component.child.expanded[id]).toEqual(StepDetailTab.Item);
    });

    it('should exclude inputs tab for recipe with no inputs', () => {
      const i = `${ItemId.Coal}.${RecipeId.Coal}`;
      component.steps = [
        {
          itemId: ItemId.Coal,
          items: Rational.one,
          recipeId: RecipeId.Coal,
          parents: {},
          factories: Rational.one,
        },
      ];
      fixture.detectChanges();
      expect(component.child.details[i].length).toEqual(3);
    });
  });

  describe('setDisplayedSteps', () => {
    it('should set displayed steps to the full list', () => {
      expect(component.child.displayedSteps).toEqual(component.child.steps);
    });

    it('should set displayed steps to selected step', () => {
      const id = `${ItemId.WoodenChest}.${ItemId.WoodenChest}`;
      component.mode = ListMode.Focus;
      component.selected = Mocks.Step1.itemId;
      fixture.detectChanges();
      expect(component.child.displayedSteps).toEqual([
        component.child.steps[0],
      ]);
      expect(component.child.expanded).toEqual({
        [id]: StepDetailTab.Item,
      });
    });

    it('should set displayed steps and expanded to empty if nothing is selected', () => {
      component.mode = ListMode.Focus;
      fixture.detectChanges();
      expect(component.child.displayedSteps).toEqual([]);
      expect(component.child.expanded).toEqual({});
    });
  });

  describe('link', () => {
    it('should return itemId or recipeId', () => {
      expect(
        component.child.link({ itemId: ItemId.Wood, items: null })
      ).toEqual('#wood');
      expect(
        component.child.link({
          itemId: null,
          items: null,
          recipeId: RecipeId.Coal,
        })
      ).toEqual('#coal');
    });
  });

  describe('findStep', () => {
    it('should find the step with a specific item id', () => {
      expect(component.child.findStep(Mocks.Step1.itemId)).toEqual(
        component.child.steps[0]
      );
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

    it('should handle no match for the inserter in the dataset', () => {
      component.child.data = { ...Mocks.AdjustedData, ...{ itemEntities: {} } };
      expect(component.child.inserter(Rational.one)).toBeNull();
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

  describe('changeFactory', () => {
    it('should set a factory', () => {
      spyOn(component, 'setFactory');
      component.child.changeFactory(Mocks.Step1, ItemId.AssemblingMachine1);
      expect(component.setFactory).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: ItemId.AssemblingMachine1,
        default: ItemId.AssemblingMachine3,
      });
    });
  });

  describe('changeFactoryModule', () => {
    it('should set factory modules', () => {
      spyOn(component, 'setFactoryModules');
      component.child.changeFactoryModule(Mocks.Step1, ItemId.SpeedModule, 0);
      expect(component.setFactoryModules).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: new Array(4).fill(ItemId.SpeedModule),
        default: new Array(4).fill(ItemId.SpeedModule3),
      });
    });
  });

  describe('changeBeaconModule', () => {
    it('should beacon modules', () => {
      spyOn(component, 'setBeaconModules');
      component.child.changeBeaconModule(Mocks.Step1, ItemId.SpeedModule, 0);
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

  describe('changeBeaconCount', () => {
    it('should set beacon count', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.setTextDt(fixture, DataTest.Beacons, '12');
      fixture.detectChanges();
      expect(component.setBeaconCount).toHaveBeenCalledWith({
        id: Mocks.Step1.itemId,
        value: '12',
        default: '8',
      });
    });

    it('should not set beacon count on invalid event', () => {
      spyOn(component, 'setBeaconCount');
      const event: any = { target: {} };
      component.child.changeBeaconCount(Mocks.Step1.itemId as any, event);
      expect(component.setBeaconCount).not.toHaveBeenCalled();
    });

    it('should not emit on invalid value', () => {
      spyOn(component, 'setBeaconCount');
      TestUtility.setTextDt(fixture, DataTest.Beacons, '-1');
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
