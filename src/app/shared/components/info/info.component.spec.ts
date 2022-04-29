import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUtility } from 'src/tests';
import { InfoComponent } from './info.component';

enum DataTest {
  LabInfo = 'lab-info',
}

@Component({
  selector: 'lab-test-info',
  template: `<lab-info
    data-test="lab-info"
    [text]="text"
    [tooltip]="tooltip"
  ></lab-info>`,
})
class TestInfoComponent {
  @ViewChild(InfoComponent) child!: InfoComponent;
  text = 'text';
  tooltip = 'tooltip';
}

describe('InfoComponent', () => {
  let component: TestInfoComponent;
  let fixture: ComponentFixture<TestInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoComponent, TestInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mouseenter', () => {
    it('should set the hover value to true', () => {
      component.child.hover = false;
      TestUtility.dispatchDt(fixture, DataTest.LabInfo, 'mouseenter');
      fixture.detectChanges();
      expect(component.child.hover).toBeTrue();
    });
  });

  describe('mouseleave', () => {
    it('should set the hover value to false', () => {
      component.child.hover = true;
      TestUtility.dispatchDt(fixture, DataTest.LabInfo, 'mouseleave');
      fixture.detectChanges();
      expect(component.child.hover).toBeFalse();
    });
  });
});
