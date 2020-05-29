import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as Mocks from 'src/mocks';
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
      declarations: [IconComponent],
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
});
