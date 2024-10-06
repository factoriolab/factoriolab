import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { TranslatePipe } from './translate.pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        {
          provide: ChangeDetectorRef,
          useValue: { markForCheck: (): void => {} },
        },
        TranslatePipe,
      ],
    });
    pipe = TestBed.inject(TranslatePipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});
