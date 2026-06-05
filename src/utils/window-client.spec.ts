import { TestBed } from '@angular/core/testing';

import { WindowClient } from './window-client';

describe('WindowClient', () => {
  let service: WindowClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowClient);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('copyToClipboard', () => {
    it('should call clipboard.writeText', async () => {
      spyOn(window.navigator.clipboard, 'writeText');
      await service.copyToClipboard('text');
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('text');
    });
  });
});
