import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeProductivityDialog } from './recipe-productivity-dialog';

describe('RecipeProductivityDialog', () => {
  let component: RecipeProductivityDialog;
  let fixture: ComponentFixture<RecipeProductivityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeProductivityDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeProductivityDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
