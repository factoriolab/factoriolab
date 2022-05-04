import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { NONE } from '~/models';
import { OptionsComponent } from './options.component';

@Component({
  selector: 'lab-test-options',
  template: `<lab-options
    [title]="title"
    [selected]="selected"
    [options]="options"
    (selectId)="selectId($event)"
  ></lab-options>`,
})
class TestOptionsComponent {
  @ViewChild(OptionsComponent) child!: OptionsComponent<number>;
  title = 'title';
  selected = 1;
  options = [
    { id: 1, name: 'o1' },
    { id: 2, name: 'o2' },
  ];
  selectId(data: number): void {}
}

describe('OptionsComponent', () => {
  let component: TestOptionsComponent;
  let fixture: ComponentFixture<TestOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionsComponent, TestOptionsComponent],
      imports: [TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle no matching selected id', () => {
    component.selected = 0;
    fixture.detectChanges();
    expect(component.child.text).toEqual(NONE);
  });
});
