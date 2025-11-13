import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDetail } from './category-detail';

describe('CategoryDetail', () => {
  let component: CategoryDetail;
  let fixture: ComponentFixture<CategoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
