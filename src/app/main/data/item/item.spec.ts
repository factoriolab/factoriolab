import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Item } from './item';

describe('Item', () => {
  let component: Item;
  let fixture: ComponentFixture<Item>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Item]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Item);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
