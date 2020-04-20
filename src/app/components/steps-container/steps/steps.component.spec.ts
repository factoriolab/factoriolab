import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as mocks from 'src/mocks';
import { Step } from '~/models';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '~/components/icon/icon.component';
import { StepsComponent } from './steps.component';

@Component({
  selector: 'lab-test-steps',
  template: `
    <lab-steps [steps]="steps" (editBeaconCount)="editBeaconCount($event)">
    </lab-steps>
  `,
})
class TestStepsComponent {
  @ViewChild(StepsComponent) child: StepsComponent;
  steps: Step[] = mocks.Steps;
  editBeaconCount(data) {}
}

describe('StepsComponent', () => {
  let component: TestStepsComponent;
  let fixture: ComponentFixture<TestStepsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, StepsComponent, TestStepsComponent],
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

  it('should edit beacon count', () => {
    spyOn(component, 'editBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '24');
    fixture.detectChanges();
    expect(component.editBeaconCount).toHaveBeenCalledWith([
      mocks.Step1.itemId,
      24,
    ]);
  });

  it('should handle steps that specify a recipe', () => {
    spyOn(component, 'editBeaconCount');
    TestUtility.selectSelector(fixture, 'input', '24', 1);
    fixture.detectChanges();
    expect(component.editBeaconCount).toHaveBeenCalledWith([
      mocks.Step2.settings.recipeId,
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
});
