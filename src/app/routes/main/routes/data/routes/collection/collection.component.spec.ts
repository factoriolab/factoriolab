import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestModule, TestUtility } from 'src/tests';

import { CollectionComponent } from './collection.component';

describe('CollectionComponent', () => {
  let component: CollectionComponent;
  let fixture: ComponentFixture<CollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, CollectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionComponent);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
      label: 'data.categories',
      type: 'category',
      key: 'categoryIds',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
