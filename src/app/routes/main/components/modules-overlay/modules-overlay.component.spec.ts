import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import { ModulesOverlayComponent } from './modules-overlay.component';

describe('ModulesOverlayComponent', () => {
  let component: ModulesOverlayComponent;
  let fixture: ComponentFixture<ModulesOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModulesOverlayComponent],
      imports: [AppSharedModule, TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
