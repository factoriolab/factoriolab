import { TestBed } from '@angular/core/testing';

import { Ripple } from './ripple';

describe('Ripple', () => {
  let directive: Ripple;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      directive = new Ripple();
    });
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  describe('ripple', () => {
    it('should create a ripple element and apply classes', () => {
      const rippleEl = {
        classList: { add: (): void => {} },
        style: { width: '', height: '', left: '', top: '' },
        addEventListener: (_name: string, _fn: () => void): void => {},
        remove: (): void => {},
      };
      spyOn(rippleEl.classList, 'add');
      spyOn(rippleEl, 'addEventListener').and.callFake((name, fn): void => {
        fn();
      });
      spyOn(rippleEl, 'remove');
      spyOn(directive['document'], 'createElement').and.returnValue(
        rippleEl as any,
      );
      const event = {
        currentTarget: {
          getBoundingClientRect: (): any => ({ width: 16, height: 16 }),
          appendChild: (): void => {},
        },
      };
      spyOn(event.currentTarget, 'appendChild');
      directive.ripple(event as any);
      expect(rippleEl.style.width).toBeTruthy();
      expect(rippleEl.style.height).toBeTruthy();
      expect(rippleEl.style.left).toBeTruthy();
      expect(rippleEl.style.top).toBeTruthy();
      expect(event.currentTarget.appendChild).toHaveBeenCalled();
      expect(rippleEl.addEventListener).toHaveBeenCalled();
      expect(rippleEl.remove).toHaveBeenCalled();
    });
  });
});
