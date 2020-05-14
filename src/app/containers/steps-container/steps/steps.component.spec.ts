import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';

import * as mocks from 'src/mocks';
import { IconComponent, SelectComponent } from '~/components';
import { Step, ItemId } from '~/models';
import { RouterService } from '~/services/router.service';
import { reducers, metaReducers } from '~/store';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { RecipeUtility } from '~/utilities';
import { TestUtility } from '~/utilities/test';
import { StepsComponent } from './steps.component';

@Component({
  selector: 'lab-test-steps',
  template: `
    <lab-steps
      [data]="data"
      [recipe]="recipe"
      [steps]="steps"
      [itemPrecision]="itemPrecision"
      [beltPrecision]="beltPrecision"
      [factoryPrecision]="factoryPrecision"
      (ignoreStep)="ignoreStep($event)"
      (setBelt)="setBelt($event)"
      (setFactory)="setFactory($event)"
      (setModules)="setModules($event)"
      (setBeaconModule)="setBeaconModule($event)"
      (setBeaconCount)="setBeaconCount($event)"
      (resetStep)="resetStep($event)"
    >
    </lab-steps>
  `,
})
class TestStepsComponent {
  @ViewChild(StepsComponent) child: StepsComponent;
  data: DatasetState = mocks.Data;
  recipe: RecipeState = mocks.RecipeSettingsInitial;
  steps: Step[] = mocks.Steps;
  itemPrecision = null;
  beltPrecision = 0;
  factoryPrecision = 1;
  ignoreStep(data) {}
  setBelt(data) {}
  setFactory(data) {}
  setModules(data) {}
  setBeaconModule(data) {}
  setBeaconCount(data) {}
  resetStep(data) {}
}

describe('StepsComponent', () => {
  let component: TestStepsComponent;
  let fixture: ComponentFixture<TestStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        SelectComponent,
        StepsComponent,
        TestStepsComponent,
      ],
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      providers: [RouterService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestStepsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set a specific factory module', () => {
    spyOn(component, 'setModules');
    TestUtility.clickSelector(fixture, '.steps-edit-factory-module', 1);
    fixture.detectChanges();
    TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
    fixture.detectChanges();
    expect(component.setModules).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      [ItemId.Module, ItemId.SpeedModule],
    ]);
  });

  it('should set all factory modules', () => {
    spyOn(component, 'setModules');
    TestUtility.clickSelector(fixture, '.steps-edit-factory-module', 0);
    fixture.detectChanges();
    TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
    fixture.detectChanges();
    expect(component.setModules).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      [ItemId.SpeedModule, ItemId.SpeedModule],
    ]);
  });

  it('should set beacon count', () => {
    spyOn(component, 'setBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '24');
    fixture.detectChanges();
    expect(component.setBeaconCount).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      24,
    ]);
  });

  it('should not set beacon count on invalid event', () => {
    spyOn(component, 'setBeaconCount');
    const event = { target: {} };
    component.child.beaconCountChange(mocks.Step1.itemId as any, event);
    expect(component.setBeaconCount).not.toHaveBeenCalled();
  });

  it('should not set beacon count if unchanged', () => {
    spyOn(component, 'setBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '0');
    fixture.detectChanges();
    expect(component.setBeaconCount).not.toHaveBeenCalled();
  });

  describe('prodAllowed', () => {
    it('should look up whether prod is allowed for a step', () => {
      spyOn(RecipeUtility, 'prodModuleAllowed').and.callThrough();
      const result = component.child.prodAllowed(mocks.Steps[0]);
      expect(RecipeUtility.prodModuleAllowed).toHaveBeenCalled();
      expect(result).toEqual(false);
    });
  });
});
