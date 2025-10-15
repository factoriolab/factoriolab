import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPreferencesDialog } from './user-preferences-dialog';

describe('UserPreferencesDialog', () => {
  let component: UserPreferencesDialog;
  let fixture: ComponentFixture<UserPreferencesDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPreferencesDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPreferencesDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
