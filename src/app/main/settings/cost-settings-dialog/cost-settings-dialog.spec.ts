import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostSettingsDialog } from './cost-settings-dialog';

describe('CostSettingsDialog', () => {
  let component: CostSettingsDialog;
  let fixture: ComponentFixture<CostSettingsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostSettingsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostSettingsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
