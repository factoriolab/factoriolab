import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeaconsOverlayComponent } from './beacons-overlay.component';

describe('BeaconsOverlayComponent', () => {
  let component: BeaconsOverlayComponent;
  let fixture: ComponentFixture<BeaconsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeaconsOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeaconsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
