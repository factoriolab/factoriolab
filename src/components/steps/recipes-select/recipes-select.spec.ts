import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipesSelect } from './recipes-select';

describe('RecipesSelect', () => {
  let component: RecipesSelect;
  let fixture: ComponentFixture<RecipesSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipesSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipesSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
