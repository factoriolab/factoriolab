import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as Mocks from 'src/mocks';
import { Entities, RecipeId } from '~/models';
import { DatasetState } from '~/store/dataset';
import { initialSettingsState } from '~/store/settings';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '../icon/icon.component';
import { RankerComponent } from './ranker.component';

@Component({
  selector: 'lab-test-ranker',
  template: `
    <lab-toggle
      [data]="data"
      [recipeDisabled]="recipeDisabled"
      (cancel)="cancel()"
      (enableRecipe)="enableRecipe($event)"
      (disableRecipe)="disableRecipe($event)"
    >
    </lab-toggle>
  `,
})
class TestRankerComponent {
  @ViewChild(RankerComponent) child: RankerComponent;
  data: DatasetState = Mocks.Data;
  recipeDisabled: Entities<boolean> = initialSettingsState.recipeDisabled;
  cancel() {}
  enableRecipe(data) {}
  disableRecipe(data) {}
  selectId(data) {}
}

describe('RankerComponent', () => {
  let component: TestRankerComponent;
  let fixture: ComponentFixture<TestRankerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, RankerComponent, TestRankerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set opening to false on first click event', () => {
    spyOn(component, 'cancel');
    document.body.click();
    expect(component.cancel).not.toHaveBeenCalled();
    expect(component.child.opening).toEqual(false);
  });

  it('should cancel when clicked away', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    document.body.click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-toggle');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should enable a recipe', () => {
    spyOn(component, 'enableRecipe');
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-icon.clickable', 0);
    expect(component.enableRecipe).toHaveBeenCalledWith(
      RecipeId.BasicOilProcessing
    );
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should disable a recipe', () => {
    spyOn(component, 'disableRecipe');
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-icon.clickable', 1);
    expect(component.disableRecipe).toHaveBeenCalledWith(
      RecipeId.AdvancedOilProcessing
    );
    expect(component.cancel).not.toHaveBeenCalled();
  });
});
