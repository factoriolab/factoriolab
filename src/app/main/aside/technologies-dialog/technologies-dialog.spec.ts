import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologiesDialog } from './technologies-dialog';

describe('TechnologiesDialog', () => {
  let component: TechnologiesDialog;
  let fixture: ComponentFixture<TechnologiesDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnologiesDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnologiesDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
