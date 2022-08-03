import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoriesDialogComponent } from './factories-dialog.component';

describe('FactoriesDialogComponent', () => {
  let component: FactoriesDialogComponent;
  let fixture: ComponentFixture<FactoriesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FactoriesDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactoriesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
