import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemData } from './item-data';

describe('ItemData', () => {
  let component: ItemData;
  let fixture: ComponentFixture<ItemData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemData],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
