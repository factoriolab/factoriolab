import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, RecipeId, TestUtility } from 'src/tests';
import { DisplayRate } from '~/models';
import { IconComponent } from './icon.component';

enum DataTest {
  LabIcon = 'lab-icon',
}

@Component({
  selector: 'lab-test-icon',
  template: `<lab-icon
    data-test="lab-icon"
    [iconId]="iconId"
    [scale]="scale"
    [text]="text"
    [data]="data"
    [tooltip]="tooltip"
    [recipe]="recipe"
    [item]="item"
    [displayRate]="displayRate"
  ></lab-icon>`,
})
class TestIconComponent {
  @ViewChild(IconComponent) child: IconComponent;
  iconId = Mocks.Item1.id;
  scale = false;
  text = Mocks.Item1.name;
  data = Mocks.Data;
  tooltip = 'This is a tooltip';
  recipe = Mocks.Data.recipeEntities[Mocks.Item1.id];
  item = null;
  displayRate = DisplayRate.PerSecond;
}

describe('IconComponent', () => {
  let component: TestIconComponent;
  let fixture: ComponentFixture<TestIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconComponent, TestIconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should handle scaled icons', () => {
      component.child.scale = true;
      component.child.scrollTop = 40;
      component.child.ngOnChanges();
      expect(component.child.tooltipMarginTop).toEqual(0);
    });

    it('should handle non-scaled icons', () => {
      component.child.scale = false;
      component.child.scrollTop = 72;
      component.child.ngOnChanges();
      expect(component.child.tooltipMarginTop).toEqual(0);
    });

    it('should switch to a recipe-specific icon', () => {
      const icon = Mocks.Data.iconEntities[RecipeId.Coal];
      component.data = {
        ...Mocks.Data,
        ...{
          iconEntities: {
            ...Mocks.Data.iconEntities,
            ...{ [Mocks.Item1.id + '|recipe']: icon },
          },
        },
      };
      fixture.detectChanges();
      expect(component.child.icon).toEqual(icon);
    });
  });

  describe('mouseenter', () => {
    it('should set the hover value to true', () => {
      component.child.hover = false;
      TestUtility.dispatchDt(fixture, DataTest.LabIcon, 'mouseenter');
      fixture.detectChanges();
      expect(component.child.hover).toBeTrue();
    });
  });

  describe('mouseleave', () => {
    it('should set the hover value to false', () => {
      component.child.hover = true;
      TestUtility.dispatchDt(fixture, DataTest.LabIcon, 'mouseleave');
      fixture.detectChanges();
      expect(component.child.hover).toBeFalse();
    });
  });

  describe('round', () => {
    it('should truncate long numbers', () => {
      expect(component.child.round(0.333333)).toEqual(0.33);
      expect(component.child.round(100)).toEqual(100);
    });
  });

  describe('power', () => {
    it('should use appropriate units', () => {
      expect(component.child.power(500)).toEqual('500 kW');
      expect(component.child.power(5000)).toEqual('5 MW');
    });

    it('should handle string for drain', () => {
      expect(component.child.power('150/30')).toEqual('5 kW');
    });
  });

  describe('toBonusPercent', () => {
    it('should handle positive percentage bonus', () => {
      expect(component.child.toBonusPercent(0.1)).toEqual('+10%');
    });

    it('should handle negative percentage bonus', () => {
      expect(component.child.toBonusPercent(-0.1)).toEqual('-10%');
    });

    it('should handle zero percentage bonus', () => {
      expect(component.child.toBonusPercent(0)).toBeNull();
    });
  });
});
