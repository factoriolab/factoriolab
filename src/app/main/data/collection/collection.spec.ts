import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Collection } from './collection';

describe('Collection', () => {
  let component: Collection;
  let fixture: ComponentFixture<Collection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Collection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Collection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
