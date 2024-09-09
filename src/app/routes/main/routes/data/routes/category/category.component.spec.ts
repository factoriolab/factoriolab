import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mocks, TestModule, TestUtility } from 'src/tests';

import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CategoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
      id: Mocks.CategoryId,
      collectionLabel: 'data.items',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
