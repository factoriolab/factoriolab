import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Mocks, RecipeId } from 'src/tests';
import { IconComponent, InputComponent, InfoComponent } from '~/components';
import { ValidateNumberDirective } from '~/support';
import { MatrixComponent } from './matrix.component';

@Component({
  selector: 'lab-test-matrix',
  template: `<lab-matrix
    [data]="data"
    [result]="result"
    [costFactor]="costFactor"
    [costFactory]="costFactory"
    [costInput]="costInput"
    [costIgnored]="costIgnored"
    [recipeRaw]="recipeRaw"
    [modifiedCost]="modifiedCost"
    [modifiedRecipeCost]="modifiedRecipeCost"
    (setCostFactory)="setCostFactor($event)"
    (setCostFactory)="setCostFactory($event)"
    (setCostInput)="setCostInput($event)"
    (setCostIgnored)="setCostIgnored($event)"
    (setRecipeCost)="setRecipeCost($event)"
    (resetCost)="resetCost()"
    (resetRecipeCost)="resetRecipeCost()"
  ></lab-matrix>`,
})
class TestMatrixComponent {
  @ViewChild(MatrixComponent) child: MatrixComponent;
  data = Mocks.AdjustedData;
  result = Mocks.MatrixResultSolved;
  costFactor = '1';
  costFactory = '1';
  costInput = '1000000';
  costIgnored = '0';
  recipeRaw = {};
  modifiedCost = false;
  modifiedRecipeCost = false;
  setCostFactor(data): void {}
  setCostFactory(data): void {}
  setCostIgnored(data): void {}
  setCostInput(data): void {}
  setRecipeCost(data): void {}
  resetCost(): void {}
  resetRecipeCost(): void {}
}

describe('MatrixComponent', () => {
  let component: TestMatrixComponent;
  let fixture: ComponentFixture<TestMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [
        IconComponent,
        InfoComponent,
        InputComponent,
        ValidateNumberDirective,
        TestMatrixComponent,
        MatrixComponent,
      ],
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

  describe('trackRowBy', () => {
    it('should use recipe id', () => {
      expect(component.child.trackRowBy(1, null)).toEqual(RecipeId.WoodenChest);
    });
  });
});
