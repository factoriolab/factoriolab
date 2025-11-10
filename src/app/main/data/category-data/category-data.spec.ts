import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryData } from './category-data';

describe('CategoryData', () => {
  let component: CategoryData;
  let fixture: ComponentFixture<CategoryData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryData],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
