import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { TechnologiesImportDialog } from './technologies-import-dialog';

describe('TechnologiesImportDialog', () => {
  let component: TechnologiesImportDialog;
  let fixture: ComponentFixture<TechnologiesImportDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TechnologiesImportDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologiesImportDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('copyScript', () => {
    it('should copy to clipboard and change the button text', async () => {
      spyOn(component['windowClient'], 'copyToClipboard');
      spyOn(component['copyText'], 'set');
      await component.copyScript();
      expect(component['windowClient'].copyToClipboard).toHaveBeenCalled();
      expect(component['copyText'].set).toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('should match technology ids and handle bad / empty', () => {
      component['value'].set('automation,fast-inserter,asdf,');
      spyOn(component['dialogRef'], 'close');
      component.save();
      expect(component['dialogRef'].close).toHaveBeenCalledWith([
        'automation',
        'fast-inserter-technology',
      ]);
    });
  });
});
