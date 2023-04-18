import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionTableComponent } from './collection-table.component';

describe('CollectionTableComponent', () => {
  let component: CollectionTableComponent;
  let fixture: ComponentFixture<CollectionTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectionTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
