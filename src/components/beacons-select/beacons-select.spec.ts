import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconsSelect } from './beacons-select';

describe('BeaconsSelect', () => {
  let component: BeaconsSelect;
  let fixture: ComponentFixture<BeaconsSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeaconsSelect]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeaconsSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
