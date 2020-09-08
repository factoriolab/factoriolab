import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Mocks, ItemId, TestUtility } from 'src/tests';
import { IconComponent } from '../icon/icon.component';
import { PrecisionComponent } from './precision.component';

@Component({
  selector: 'lab-test-precision',
  template: `
    <lab-precision
      [data]="data"
      [iconId]="iconId"
      [tooltip]="tooltip"
      [value]="value"
      [default]="default"
      (setValue)="setValue($event)"
    >
    </lab-precision>
  `,
})
class TestPrecisionComponent {
  @ViewChild(PrecisionComponent) child: PrecisionComponent;
  data = Mocks.Data;
  iconId = ItemId.Coal;
  tooltip = 'tooltip';
  value = 2;
  default = 1;
  setValue(data) {}
}

describe('PrecisionComponent', () => {
  let component: TestPrecisionComponent;
  let fixture: ComponentFixture<TestPrecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [IconComponent, PrecisionComponent, TestPrecisionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPrecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit new values', () => {
    spyOn(component, 'setValue');
    TestUtility.selectSelector(fixture, '.precision-decimal', '2');
    fixture.detectChanges();
    expect(component.setValue).toHaveBeenCalledWith(2);
  });

  it('should ignore invalid values', () => {
    spyOn(component, 'setValue');
    component.child.emitEvent({ target: null } as any);
    expect(component.setValue).not.toHaveBeenCalled();
  });
});
