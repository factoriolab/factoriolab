import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { FlowSettingsComponent } from './flow-settings.component';

describe('FlowSettingsComponent', () => {
  let component: FlowSettingsComponent;
  let fixture: ComponentFixture<FlowSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, FlowSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FlowSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
