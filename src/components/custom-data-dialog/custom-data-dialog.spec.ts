import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDataDialog } from './custom-data-dialog';

describe('CustomDataDialog', () => {
  let component: CustomDataDialog;
  let fixture: ComponentFixture<CustomDataDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDataDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDataDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
