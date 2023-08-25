import { TestBed } from '@angular/core/testing';

import { ItemId } from 'src/tests';
import { IconClassPipe, IconSmClassPipe } from './icon-class.pipe';

describe('IconClassPipe', () => {
  let pipe: IconClassPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [IconClassPipe] });
    pipe = TestBed.inject(IconClassPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate classes for icons', () => {
      expect(pipe.transform(ItemId.Coal)).toEqual('lab-icon item coal');
    });

    it('should handle null value', () => {
      expect(pipe.transform(null)).toEqual('');
    });
  });
});

describe('IconSmClassPipe', () => {
  let pipe: IconSmClassPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [IconSmClassPipe] });
    pipe = TestBed.inject(IconSmClassPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate classes for small icons', () => {
      expect(pipe.transform(ItemId.Coal)).toEqual('lab-icon sm item coal');
    });

    it('should handle null value', () => {
      expect(pipe.transform(null)).toEqual('');
    });

    it('should work as static class method', () => {
      expect(IconSmClassPipe.transform(ItemId.Coal)).toEqual(
        'lab-icon sm item coal',
      );
      expect(IconSmClassPipe.transform(null)).toEqual('');
    });
  });
});
