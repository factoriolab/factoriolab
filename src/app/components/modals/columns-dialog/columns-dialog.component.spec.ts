import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnsDialogComponent } from './columns-dialog.component';

describe('ColumnsDialogComponent', () => {
  let component: ColumnsDialogComponent;
  let fixture: ComponentFixture<ColumnsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
