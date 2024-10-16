import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { BeltOverlayComponent } from './belt-overlay.component';

describe('BeltOverlayComponent', () => {
  let component: BeltOverlayComponent;
  let fixture: ComponentFixture<BeltOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, BeltOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BeltOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
