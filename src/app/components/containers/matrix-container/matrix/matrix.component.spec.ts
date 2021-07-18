import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks } from 'src/tests';
import { IconComponent } from '~/components/icon/icon.component';
import { MatrixComponent } from './matrix.component';

@Component({
  selector: 'lab-test-matrix',
  template: `<lab-matrix [data]="data" [result]="result"></lab-matrix>`,
})
class TestMatrixComponent {
  @ViewChild(MatrixComponent) child: MatrixComponent;
  data = Mocks.AdjustedData;
  result = Mocks.MatrixResultSolved;
}

describe('MatrixComponent', () => {
  let component: TestMatrixComponent;
  let fixture: ComponentFixture<TestMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IconComponent, TestMatrixComponent, MatrixComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
