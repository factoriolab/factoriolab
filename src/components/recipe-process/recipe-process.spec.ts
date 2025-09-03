import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeProcess } from './recipe-process';

describe('RecipeProcess', () => {
  let component: RecipeProcess;
  let fixture: ComponentFixture<RecipeProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeProcess],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
