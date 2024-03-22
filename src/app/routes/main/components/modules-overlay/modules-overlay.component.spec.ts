import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesOverlayComponent } from './modules-overlay.component';

describe('ModulesOverlayComponent', () => {
  let component: ModulesOverlayComponent;
  let fixture: ComponentFixture<ModulesOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
