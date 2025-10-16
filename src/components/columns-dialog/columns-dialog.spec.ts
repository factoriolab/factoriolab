import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsDialog } from './columns-dialog';

describe('ColumnsDialog', () => {
  let component: ColumnsDialog;
  let fixture: ComponentFixture<ColumnsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
