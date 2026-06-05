import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { RecipeProcess } from './recipe-process';

describe('RecipeProcess', () => {
  let component: RecipeProcess;
  let fixture: ComponentFixture<RecipeProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeProcess],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeProcess);
    setInputs(fixture, { value: RecipeId.AdvancedCircuit });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
