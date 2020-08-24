import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks } from 'src/tests';
import { DisplayRate } from '~/models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'lab-test-icon',
  template: `<lab-icon
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, TestIconComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TestIconComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('element', () => {
    it('should return the native element', () => {
      expect(component.child.element).toBeTruthy();
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
