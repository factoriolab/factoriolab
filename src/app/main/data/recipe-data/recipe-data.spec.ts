import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeData } from './recipe-data';

describe('RecipeData', () => {
  let component: RecipeData;
  let fixture: ComponentFixture<RecipeData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeData],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
