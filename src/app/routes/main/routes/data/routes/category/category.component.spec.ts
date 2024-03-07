import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
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
    fixture.componentRef.setInput('id', Mocks.CategoryId);
    fixture.componentRef.setInput('collectionLabel', 'data.items');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
