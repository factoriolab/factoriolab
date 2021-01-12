import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, RecipeId, TestUtility } from 'src/tests';
import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { ToggleComponent } from './toggle.component';

enum DataTest {
  Open = 'lab-toggle-open',
  Recipe = 'lab-toggle-recipe',
  Close = 'lab-toggle-close',
}

@Component({
  selector: 'lab-test-toggle',
  template: `
    <lab-toggle
      [data]="data"
      [selected]="selected"
      (selectIds)="selectIds($event)"
    >
    </lab-toggle>
  `,
})
class TestToggleComponent {
  @ViewChild(ToggleComponent) child: ToggleComponent;
  data = Mocks.Data;
  selected: string[] = [RecipeId.AdvancedOilProcessing];
  selectIds(data): void {}
}

describe('ToggleComponent', () => {
  let component: TestToggleComponent;
  let fixture: ComponentFixture<TestToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DialogComponent,
        IconComponent,
        ToggleComponent,
        TestToggleComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('width', () => {
    it('should set width based on options', () => {
      expect(component.child.width).toEqual(17.25);
    });
  });

  describe('clickOpen', () => {
    it('should set up the dialog', () => {
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.edited).toBeFalse();
      expect(component.child.editValue).toEqual(component.selected);
    });
  });

  describe('close', () => {
    beforeEach(() => {
      spyOn(component, 'selectIds');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should close the dialog', () => {
      TestUtility.clickDt(fixture, DataTest.Close);
      expect(component.selectIds).not.toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });

    it('should emit edits', () => {
      component.child.edited = true;
      TestUtility.clickDt(fixture, DataTest.Close);
      expect(component.selectIds).toHaveBeenCalled();
      expect(component.child.open).toBeFalse();
    });
  });

  describe('clickId', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
    });

    it('should add the recipe to the list', () => {
      TestUtility.clickDt(fixture, DataTest.Recipe, 2);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue).toEqual([
        RecipeId.AdvancedOilProcessing,
        RecipeId.CoalLiquefaction,
      ]);
    });

    it('should remove the recipe from the list', () => {
      TestUtility.clickDt(fixture, DataTest.Recipe);
      expect(component.child.edited).toBeTrue();
      expect(component.child.editValue).toEqual([]);
    });
  });
});
