import { TestBed } from '@angular/core/testing';

import { ZEMPTY, ZFALSE, ZTRUE } from '~/models/constants';
import { rational } from '~/models/rational';

import { ZipService } from './zip.service';

describe('ZipService', () => {
  let service: ZipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('zipFields', () => {
    it('should zip a list of fields', () => {
      expect(service.zipFields(['a', 'b', '', ''])).toEqual('a*b');
    });
  });

  describe('zipString', () => {
    it('should handle undefined', () => {
      expect(service.zipString(undefined)).toEqual('');
    });

    it('should handle defined', () => {
      expect(service.zipString('a')).toEqual('a');
    });
  });

  describe('zipRational', () => {
    it('should handle undefined', () => {
      expect(service.zipRational(undefined)).toEqual('');
    });

    it('should handle defined', () => {
      expect(service.zipRational(rational.one)).toEqual('1');
    });
  });

  describe('zipNumber', () => {
    it('should handle undefined', () => {
      expect(service.zipNumber(undefined)).toEqual('');
    });

    it('should handle defined', () => {
      expect(service.zipNumber(1)).toEqual('1');
    });
  });

  describe('zipArray', () => {
    it('should handle undefined', () => {
      expect(service.zipArray(undefined)).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipArray([])).toEqual(ZEMPTY);
    });

    it('should handle defined', () => {
      expect(service.zipArray(['a'])).toEqual('a');
    });
  });

  describe('zipNString', () => {
    it('should handle undefined', () => {
      expect(service.zipNString(undefined, [])).toEqual('');
    });

    it('should handle defined', () => {
      expect(service.zipNString('b', ['a', 'b'])).toEqual('B');
    });
  });

  describe('zipDiffSubset', () => {
    it('should handle default', () => {
      expect(service.zipDiffSubset(undefined, undefined, [])).toEqual('');
      expect(service.zipDiffSubset(new Set('a'), new Set('a'), [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipDiffSubset(new Set(), new Set(), [])).toEqual('');
      expect(service.zipDiffSubset(new Set(), undefined, [])).toEqual(ZEMPTY);
    });

    it('should handle nondefault', () => {
      expect(
        service.zipDiffSubset(
          new Set(['a', 'b', 'd', 'f']),
          undefined,
          ['a', 'b', 'c', 'd', 'e', 'f'],
          ['a', 'b', 'missing', 'c', 'd', 'e', 'f'],
        ),
      ).toEqual('A~B*E*G');
      expect(
        service.zipDiffSubset(
          new Set(['a', 'b', 'e', 'f']),
          undefined,
          ['a', 'b', 'c', 'd', 'e', 'f'],
          ['a', 'b', 'missing', 'c', 'd', 'e', 'f'],
        ),
      ).toEqual('A~B*F~G');
    });
  });

  describe('zipDiffNString', () => {
    it('should handle default', () => {
      expect(service.zipDiffString('a', 'a', [])).toEqual('');
    });

    it('should handle defined', () => {
      expect(service.zipDiffString('a', 'b', ['a'])).toEqual(['a', 'A']);
    });
  });

  describe('zipDiffNumber', () => {
    it('should handle default', () => {
      expect(service.zipDiffNumber(0, 0)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNumber(0, 1)).toEqual('0');
    });
  });

  describe('zipDiffRational', () => {
    it('should handle default', () => {
      expect(service.zipDiffRational(rational.one, rational.one)).toEqual('');
    });

    it('should handle nondefault', () => {
      expect(service.zipDiffRational(rational.one, undefined)).toEqual('1');
    });
  });

  describe('zipDiffBool', () => {
    it('should handle default', () => {
      expect(service.zipDiffBool(false, false)).toEqual('');
    });

    it('should handle nondefault', () => {
      expect(service.zipDiffBool(false, true)).toEqual(ZFALSE);
      expect(service.zipDiffBool(true, false)).toEqual(ZTRUE);
    });
  });

  describe('zipDiffIndices', () => {
    it('should handle default', () => {
      expect(service.zipDiffIndices([1, 2], [1, 2])).toEqual('');
      expect(service.zipDiffIndices(undefined, undefined)).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipDiffIndices([], undefined)).toEqual(ZEMPTY);
    });

    it('should handle defined', () => {
      expect(service.zipDiffIndices([1, 2], [])).toEqual('1~2');
    });
  });

  describe('zipDiffArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffArray(['a', 'b'], ['a', 'b'], [])).toEqual('');
      expect(service.zipDiffArray(undefined, undefined, [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipDiffArray([], undefined, [])).toEqual(ZEMPTY);
    });

    it('should handle defined', () => {
      expect(service.zipDiffArray(['b', 'a'], [], ['a', 'b'])).toEqual([
        'b~a',
        'B~A',
      ]);
    });
  });

  describe('parseString', () => {
    it('should parse undefined', () => {
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString('')).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseString('a')).toEqual('a');
    });

    it('should parse hashed value', () => {
      expect(service.parseString('A', ['a'])).toEqual('a');
    });
  });

  describe('parseBool', () => {
    it('should parse undefined', () => {
      expect(service.parseBool(undefined)).toBeUndefined();
      expect(service.parseBool('')).toBeUndefined();
    });

    it('should parse false', () => {
      expect(service.parseBool(ZFALSE)).toBeFalse();
    });

    it('should parse true', () => {
      expect(service.parseBool(ZTRUE)).toBeTrue();
    });
  });

  describe('parseNumber', () => {
    it('should parse undefined', () => {
      expect(service.parseNumber(undefined)).toBeUndefined();
      expect(service.parseNumber('')).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNumber('1')).toEqual(1);
    });
  });

  describe('parseRational', () => {
    it('should parse undefined', () => {
      expect(service.parseRational(undefined)).toBeUndefined();
      expect(service.parseRational('')).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseRational('1')).toEqual(rational.one);
    });
  });

  describe('parseArray', () => {
    it('should parse undefined', () => {
      expect(service.parseArray(undefined)).toBeUndefined();
      expect(service.parseArray('')).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseArray(ZEMPTY)).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseArray('a~b')).toEqual(['a', 'b']);
    });

    it('should parse hashed value', () => {
      expect(service.parseArray('A~B', ['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('parseIndices', () => {
    it('should parse undefined', () => {
      expect(service.parseIndices(undefined, [])).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseIndices(ZEMPTY, [])).toEqual([]);
    });

    it('should parse defined', () => {
      expect(service.parseIndices('0~1', [{ a: 'a' }])).toEqual([
        { a: 'a' },
        {} as any,
      ]);
    });
  });

  describe('parseNString', () => {
    it('should parse undefined', () => {
      expect(service.parseNString(undefined, [])).toBeUndefined();
      expect(service.parseNString('', [])).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNString('A', ['a'])).toEqual('a');
    });
  });

  describe('parseNArray', () => {
    it('should parse undefined', () => {
      expect(service.parseNArray(undefined, [])).toBeUndefined();
      expect(service.parseNArray('', [])).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseNArray(ZEMPTY, [])).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseNArray('A~B', ['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('parseSubset', () => {
    it('should parse undefined', () => {
      expect(service.parseSubset(undefined, [])).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseSubset(ZEMPTY, [])).toEqual(new Set());
    });

    it('should parse defined', () => {
      expect(
        service.parseSubset('A~B*G', ['a', 'b', 'missing', 'c', 'd', 'e', 'f']),
      ).toEqual(new Set(['a', 'b', 'f']));
    });
  });
});
