import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import { BeaconsOverlayComponent } from './beacons-overlay.component';

describe('BeaconsOverlayComponent', () => {
  let component: BeaconsOverlayComponent;
  let fixture: ComponentFixture<BeaconsOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BeaconsOverlayComponent],
      imports: [AppSharedModule, TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BeaconsOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
