import { TestBed } from '@angular/core/testing';

import { Accordion } from './accordion';

describe('Accordion', () => {
  let directive: Accordion;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      directive = new Accordion();
    });
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });
});
