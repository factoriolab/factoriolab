import { TestBed } from '@angular/core/testing';

import { ItemId } from '~/tests';

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
      expect(pipe.transform(undefined)).toEqual('');
    });

    it('should handle quality', () => {
      expect(pipe.transform('id(5)')).toEqual('lab-icon item id q5');
    });

    it('should work as a static class method', () => {
      expect(IconClassPipe.transform(ItemId.Coal)).toEqual(
        'lab-icon item coal',
      );
      expect(IconClassPipe.transform(undefined)).toEqual('');
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
      expect(pipe.transform(ItemId.Coal)).toEqual('lab-icon item coal sm');
    });

    it('should handle null value', () => {
      expect(pipe.transform(undefined)).toEqual('');
    });

    it('should work as static class method', () => {
      expect(IconSmClassPipe.transform(ItemId.Coal)).toEqual(
        'lab-icon item coal sm',
      );
      expect(IconSmClassPipe.transform(undefined)).toEqual('');
    });
  });
});
