import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowSettingsDialog } from './flow-settings-dialog';

describe('FlowSettingsDialog', () => {
  let component: FlowSettingsDialog;
  let fixture: ComponentFixture<FlowSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowSettingsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowSettingsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
