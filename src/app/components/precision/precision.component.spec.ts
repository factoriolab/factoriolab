import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecisionComponent } from './precision.component';

describe('PrecisionComponent', () => {
  let component: PrecisionComponent;
  let fixture: ComponentFixture<PrecisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrecisionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
