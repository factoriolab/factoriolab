import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeProductivityComponent } from './recipe-productivity.component';

describe('RecipeProductivityComponent', () => {
  let component: RecipeProductivityComponent;
  let fixture: ComponentFixture<RecipeProductivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeProductivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeProductivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
