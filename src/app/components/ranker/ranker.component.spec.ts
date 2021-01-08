import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, ItemId } from 'src/tests';
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
      [parent]="element.nativeElement"
      (cancel)="cancel()"
      (commit)="commit($event)"
    >
    </lab-ranker>
  `,
})
class TestRankerComponent {
  @ViewChild(RankerComponent) child: RankerComponent;
  data: Dataset = Mocks.Data;
  rank = [ItemId.AssemblingMachine1];
  options = [ItemId.AssemblingMachine2];
  cancel() {}
  commit(data) {}

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

  // it('should set top based on parent', () => {
  //   component.child.parent = { getBoundingClientRect: () => ({ y: 0 }) } as any;
  //   expect(component.child.top).toEqual(-4);
  //   component.child.parent = null;
  //   expect(component.child.top).toEqual(-4);
  // });

  // it('should set left based on parent', () => {
  //   component.child.parent = { getBoundingClientRect: () => ({ x: 0 }) } as any;
  //   expect(component.child.left).toEqual(-14);
  //   component.child.parent = null;
  //   expect(component.child.left).toEqual(-4);
  // });

  it('should set width based on options', () => {
    expect(component.child.width).toEqual(8);
  });

  // it('should set opening to false on first click event', () => {
  //   spyOn(component, 'cancel');
  //   document.body.click();
  //   expect(component.cancel).not.toHaveBeenCalled();
  //   expect(component.child.opening).toEqual(false);
  // });

  // it('should commit when clicked away with edits', () => {
  //   spyOn(component, 'commit');
  //   const value = ['A'];
  //   component.child.opening = false;
  //   component.child.edited = true;
  //   component.child.editValue = value;
  //   document.body.click();
  //   expect(component.commit).toHaveBeenCalledWith(value);
  // });

  // it('should cancel when clicked away with no edits', () => {
  //   spyOn(component, 'cancel');
  //   component.child.opening = false;
  //   document.body.click();
  //   expect(component.cancel).toHaveBeenCalled();
  // });

  // it('should not cancel when clicked on', () => {
  //   spyOn(component, 'cancel');
  //   component.child.opening = false;
  //   TestUtility.clickSelector(fixture, 'lab-ranker');
  //   expect(component.cancel).not.toHaveBeenCalled();
  // });

  // it('should prefer an item', () => {
  //   component.child.opening = false;
  //   TestUtility.clickSelector(fixture, 'lab-icon', 1);
  //   expect(component.child.edited).toBeTrue();
  //   expect(component.child.editValue).toEqual([
  //     ItemId.AssemblingMachine1,
  //     ItemId.AssemblingMachine2,
  //   ]);
  // });

  // it('should drop an item', () => {
  //   component.child.opening = false;
  //   TestUtility.clickSelector(fixture, 'lab-icon', 0);
  //   expect(component.child.edited).toBeTrue();
  //   expect(component.child.editValue).toEqual([]);
  // });
});
