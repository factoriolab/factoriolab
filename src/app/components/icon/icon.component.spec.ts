import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { Mocks, RecipeId, TestUtility, initialState } from 'src/tests';
import { ItemId, Rational } from '~/models';
import * as Settings from '~/store/settings';
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
    [tooltip]="tooltip"
    [hoverIcon]="hoverIcon"
    [scrollTop]="scrollTop"
    [scrollLeft]="scrollLeft"
    [recipe]="recipe"
    [item]="item"
  ></lab-icon>`,
})
class TestIconComponent {
  @ViewChild(IconComponent) child!: IconComponent;
  iconId: string | undefined = Mocks.Item1.id;
  scale = false;
  text = Mocks.Item1.name;
  tooltip = 'This is a tooltip';
  hoverIcon = '';
  scrollTop = 0;
  scrollLeft = 0;
  recipe = Mocks.Data.recipeEntities[Mocks.Item1.id];
  item = null;
}

describe('IconComponent', () => {
  let component: TestIconComponent;
  let fixture: ComponentFixture<TestIconComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconComponent, TestIconComponent],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestIconComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should handle scaled icons', () => {
      component.scale = true;
      component.scrollTop = 40;
      fixture.detectChanges();
      expect(component.child.tooltipMarginTop).toEqual(0);
    });

    it('should handle non-scaled icons', () => {
      component.scale = false;
      component.scrollTop = 72;
      fixture.detectChanges();
      expect(component.child.tooltipMarginTop).toEqual(0);
    });

    it('should switch to a recipe-specific icon', () => {
      const icon = Mocks.Data.iconEntities[RecipeId.Coal];
      component.iconId = ItemId.Inserter;
      Settings.getDataset.setResult({
        ...Mocks.Data,
        ...{
          iconEntities: {
            ...Mocks.Data.iconEntities,
            ...{ [ItemId.Inserter + '|recipe']: icon },
          },
        },
      });
      store.refreshState();
      fixture.detectChanges();
      expect(component.child.icon).toEqual(icon);
    });

    it('should handle undefined icon id', () => {
      component.iconId = undefined;
      fixture.detectChanges();
      expect(component.child.icon).toBeUndefined();
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
      expect(component.child.round(Rational.from(1, 3))).toEqual(0.33);
      expect(component.child.round(Rational.hundred)).toEqual(100);
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
      expect(component.child.toBonusPercent(Rational.from(1, 10))).toEqual(
        '+10%'
      );
    });

    it('should handle negative percentage bonus', () => {
      expect(component.child.toBonusPercent(Rational.from(-1, 10))).toEqual(
        '-10%'
      );
    });

    it('should handle zero percentage bonus', () => {
      expect(component.child.toBonusPercent(Rational.zero)).toBeUndefined();
    });
  });
});
