import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionTable } from './collection-table';

describe('CollectionTable', () => {
  let component: CollectionTable;
  let fixture: ComponentFixture<CollectionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
