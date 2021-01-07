import { Component, ViewChild, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUtility } from 'src/tests';
import { IconComponent } from '../icon/icon.component';
import { ColumnsComponent } from './columns.component';

@Component({
  selector: 'lab-test-columns',
  template: `
    <lab-columns
      [header]="header"
      [enabledIds]="enabledIds"
      [options]="options"
      [parent]="element.nativeElement"
      (cancel)="cancel()"
      (commit)="commit($event)"
    >
    </lab-columns>
  `,
})
class TestColumnsComponent {
  @ViewChild(ColumnsComponent) child: ColumnsComponent;
  header = 'Header';
  enabledIds = ['1'];
  options = [
    { id: '1', name: 'name1' },
    { id: '2', name: 'name2' },
  ];
  cancel() {}
  commit(data) {}

  constructor(public element: ElementRef) {}
}

describe('MultiselectComponent', () => {
  let component: TestColumnsComponent;
  let fixture: ComponentFixture<TestColumnsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [IconComponent, ColumnsComponent, TestColumnsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestColumnsComponent);
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

  it('should commit when clicked away with edits', () => {
    spyOn(component, 'commit');
    const value = ['A'];
    component.child.opening = false;
    component.child.editedValue = true;
    component.child.editValue = value;
    document.body.click();
    expect(component.commit).toHaveBeenCalledWith(value);
  });

  it('should cancel when clicked away with no edits', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    document.body.click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.header');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should enable an item', () => {
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.clickable', 1);
    expect(component.child.editedValue).toBeTrue();
    expect(component.child.editValue).toEqual(['1', '2']);
  });

  it('should disable an item', () => {
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.clickable', 0);
    expect(component.child.editedValue).toBeTrue();
    expect(component.child.editValue).toEqual([]);
  });
});
