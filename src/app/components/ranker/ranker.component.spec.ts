import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { Dataset } from '~/models';
import { IconComponent } from '../icon/icon.component';
import { RankerComponent } from './ranker.component';

@Component({
  selector: 'lab-test-ranker',
  template: `
    <lab-ranker
      [data]="data"
      [rank]="rank"
      [options]="options"
      [default]="default"
      [parent]="element.nativeElement"
      (cancel)="cancel()"
      (preferItem)="preferItem($event)"
      (dropItem)="dropItem($event)"
    >
    </lab-ranker>
  `,
})
class TestRankerComponent {
  @ViewChild(RankerComponent) child: RankerComponent;
  data: Dataset = Mocks.Data;
  rank = [ItemId.AssemblingMachine1];
  options = [ItemId.AssemblingMachine2];
  default = [];
  cancel() {}
  preferItem(data) {}
  dropItem(data) {}

  constructor(public element: ElementRef) {}
}

describe('RankerComponent', () => {
  let component: TestRankerComponent;
  let fixture: ComponentFixture<TestRankerComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, RankerComponent, TestRankerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRankerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set top based on parent', () => {
    component.child.parent = { getBoundingClientRect: () => ({ y: 0 }) } as any;
    expect(component.child.top).toEqual(-4);
    component.child.parent = null;
    expect(component.child.top).toEqual(-4);
  });

  it('should set left based on parent', () => {
    component.child.parent = { getBoundingClientRect: () => ({ x: 0 }) } as any;
    expect(component.child.left).toEqual(-14);
    component.child.parent = null;
    expect(component.child.left).toEqual(-4);
  });

  it('should set width based on options', () => {
    expect(component.child.width).toEqual(3.5);
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
    TestUtility.clickSelector(fixture, 'lab-ranker');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should prefer an item', () => {
    spyOn(component, 'preferItem');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-icon', 1);
    expect(component.preferItem).toHaveBeenCalledWith({
      id: ItemId.AssemblingMachine2,
      default: [],
    });
  });

  it('should drop an item', () => {
    spyOn(component, 'dropItem');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, 'lab-icon', 0);
    expect(component.dropItem).toHaveBeenCalledWith({
      id: ItemId.AssemblingMachine1,
      default: [],
    });
  });
});
