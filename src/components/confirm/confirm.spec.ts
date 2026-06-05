import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';

import { Confirm } from './confirm';
import { ConfirmData } from './confirm-data';
import { ConfirmDialog } from './confirm-dialog';

describe('Confirm', () => {
  let service: Confirm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Confirm);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should open using the cdk dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: EMPTY,
      } as any);
      const data: ConfirmData<number> = { header: '', message: '' };
      service.open(data);
      expect(service['dialog'].open).toHaveBeenCalledWith(ConfirmDialog, {
        data,
      });
    });
  });
});
