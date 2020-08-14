import { Component, ViewChild, ElementRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, RecipeId } from 'src/tests';
import { IconComponent } from '../icon/icon.component';
import { ToggleComponent } from './toggle.component';

@Component({
  selector: 'lab-test-toggle',
  template: `
    <lab-toggle
      [data]="data"
      [disabledRecipes]="disabledRecipes"
      [default]="default"
      [parent]="element.nativeElement"
      (cancel)="cancel()"
      (enableRecipe)="enableRecipe($event)"
      (disableRecipe)="disableRecipe($event)"
    >
    </lab-toggle>
  `,
})
class TestToggleComponent {
  @ViewChild(ToggleComponent) child: ToggleComponent;
  data = Mocks.Data;
  disabledRecipes = Mocks.SettingsState1.disabledRecipes;
  default = [];
  cancel() {}
  enableRecipe(data) {}
  disableRecipe(data) {}

  constructor(public element: ElementRef) {}
}

describe('ToggleComponent', () => {
  let component: TestToggleComponent;
  let fixture: ComponentFixture<TestToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, ToggleComponent, TestToggleComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set top based on parent', () => {
    component.child.parent = { getBoundingClientRect: () => ({ y: 0 }) } as any;
    expect(component.child.top).toEqual(1);
    component.child.parent = null;
    expect(component.child.top).toEqual(1);
  });

  it('should set left based on parent', () => {
    component.child.parent = { getBoundingClientRect: () => ({ x: 0 }) } as any;
    expect(component.child.left).toEqual(-8);
    component.child.parent = null;
    expect(component.child.left).toEqual(1);
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
    TestUtility.clickSelector(fixture, 'lab-icon.clickable', 1);
    expect(component.enableRecipe).toHaveBeenCalledWith({
      id: RecipeId.BasicOilProcessing,
      default: [],
    });
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should disable a recipe', () => {
    spyOn(component, 'disableRecipe');
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-icon.clickable', 0);
    expect(component.disableRecipe).toHaveBeenCalledWith({
      id: RecipeId.AdvancedOilProcessing,
      default: [],
    });
    expect(component.cancel).not.toHaveBeenCalled();
  });
});
