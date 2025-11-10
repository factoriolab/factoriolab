import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationData } from './location-data';

describe('LocationData', () => {
  let component: LocationData;
  let fixture: ComponentFixture<LocationData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationData],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationData);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
