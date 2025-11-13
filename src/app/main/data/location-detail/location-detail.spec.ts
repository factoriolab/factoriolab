import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDetail } from './location-detail';

describe('LocationDetail', () => {
  let component: LocationDetail;
  let fixture: ComponentFixture<LocationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
