import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { VersionsDialog } from './versions-dialog';

describe('VersionsDialog', () => {
  let component: VersionsDialog;
  let fixture: ComponentFixture<VersionsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, VersionsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
