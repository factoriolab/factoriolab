import { ComponentFixture, TestBed } from '@angular/core/testing';

import { setInputs, TestModule } from '~/tests';

import { CategoryDetail } from './category-detail';

describe('CategoryDetail', () => {
  let component: CategoryDetail;
  let fixture: ComponentFixture<CategoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CategoryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDetail);
    setInputs(fixture, { id: 'id', collectionLabel: 'collectionLabel' });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
