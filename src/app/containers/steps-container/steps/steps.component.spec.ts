import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as mocks from 'src/mocks';
import { IconComponent, SelectComponent } from '~/components';
import { Step, ItemId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';
import { TestUtility } from '~/utilities/test';
import { StepsComponent } from './steps.component';
import { RecipeUtility } from '~/utilities';

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
      (editFactoryModule)="editFactoryModule($event)"
      (editBeaconModule)="editBeaconModule($event)"
      (editBeaconCount)="editBeaconCount($event)"
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
  editFactoryModule(data) {}
  editBeaconModule(data) {}
  editBeaconCount(data) {}
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

  it('should edit a specific factory module', () => {
    spyOn(component, 'editFactoryModule');
    TestUtility.clickSelector(fixture, '.steps-edit-factory-module', 1);
    fixture.detectChanges();
    TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
    fixture.detectChanges();
    expect(component.editFactoryModule).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      [ItemId.Module, ItemId.SpeedModule],
    ]);
  });

  it('should edit all factory modules', () => {
    spyOn(component, 'editFactoryModule');
    TestUtility.clickSelector(fixture, '.steps-edit-factory-module', 0);
    fixture.detectChanges();
    TestUtility.clickSelector(fixture, 'lab-select lab-icon', 1);
    fixture.detectChanges();
    expect(component.editFactoryModule).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      [ItemId.SpeedModule, ItemId.SpeedModule],
    ]);
  });

  it('should edit beacon count', () => {
    spyOn(component, 'editBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '24');
    fixture.detectChanges();
    expect(component.editBeaconCount).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      24,
    ]);
  });

  it('should not edit beacon count on invalid event', () => {
    spyOn(component, 'editBeaconCount');
    const event = { target: {} };
    component.child.beaconCountChange(mocks.Step1.itemId as any, event);
    expect(component.editBeaconCount).not.toHaveBeenCalled();
  });

  it('should not edit beacon count if unchanged', () => {
    spyOn(component, 'editBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '0');
    fixture.detectChanges();
    expect(component.editBeaconCount).not.toHaveBeenCalled();
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
