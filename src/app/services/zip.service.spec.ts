import { TestBed } from '@angular/core/testing';

import {
  DisplayRate,
  rational,
  ZEMPTY,
  ZFALSE,
  Zip,
  ZNULL,
  ZTRUE,
} from '~/models';
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

  describe('zipList', () => {
    it('should zip a list of strings', () => {
      const mockZip: Zip = {
        bare: 'p=steel-chest**1',
        hash: 'pC6**1',
      };
      expect(service.zipList([mockZip, mockZip])).toEqual({
        bare: encodeURIComponent(mockZip.bare + '_' + mockZip.bare),
        hash: mockZip.hash + '_' + mockZip.hash,
      });
    });
  });

  describe('zipFields', () => {
    it('should zip a list of fields', () => {
      expect(service.zipFields(['a', 'b', '', ''])).toEqual('a*b');
    });
  });

  describe('zipTruthyString', () => {
    it('should handle falsy', () => {
      expect(service.zipString(undefined)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipString('a')).toEqual('a');
    });
  });

  describe('zipTruthyNum', () => {
    it('should handle falsy', () => {
      expect(service.zipNumber(undefined)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipNumber(1)).toEqual('1');
    });
  });

  describe('zipTruthyBool', () => {
    it('should handle falsy', () => {
      expect(service.zipBool(undefined)).toEqual('');
    });

    it('should handle false', () => {
      expect(service.zipBool(false)).toEqual(ZFALSE);
    });

    it('should handle true', () => {
      expect(service.zipBool(true)).toEqual(ZTRUE);
    });
  });

  describe('zipTruthyArray', () => {
    it('should handle falsy', () => {
      expect(service.zipArray(undefined)).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipArray([])).toEqual(ZEMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipArray(['a'])).toEqual('a');
    });
  });

  describe('zipTruthyNArray', () => {
    it('should handle falsy', () => {
      expect(service.zipNArray(undefined, [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipNArray([], [])).toEqual(ZEMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipNArray(['a'], ['a'])).toEqual('A');
    });
  });

  describe('zipDiffString', () => {
    it('should handle default', () => {
      expect(service.zipDiffString('a', 'a')).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffString(undefined, 'a')).toEqual(ZNULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffString('a', 'b')).toEqual('a');
    });
  });

  describe('zipDiffNumber', () => {
    it('should handle default', () => {
      expect(service.zipDiffNumber(0, 0)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNumber(undefined, 0)).toEqual(ZNULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNumber(0, 1)).toEqual('0');
    });
  });

  describe('zipDiffRational', () => {
    it('should handle default', () => {
      expect(service.zipDiffRational(rational.one, rational.one)).toEqual('');
    });

    it('should handle nullish', () => {
      expect(service.zipDiffRational(null, rational.one)).toEqual(ZNULL);
    });

    it('should handle nondefault', () => {
      expect(service.zipDiffRational(rational.one, null)).toEqual('1');
    });
  });

  describe('zipDiffDisplayRate', () => {
    it('should handle default', () => {
      expect(
        service.zipDiffDisplayRate(
          DisplayRate.PerMinute,
          DisplayRate.PerMinute,
        ),
      ).toEqual('');
    });

    it('should handle falsy', () => {
      expect(
        service.zipDiffDisplayRate(undefined, DisplayRate.PerMinute),
      ).toEqual(ZNULL);
    });

    it('should handle truthy', () => {
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerSecond, undefined),
      ).toEqual('0');
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerMinute, undefined),
      ).toEqual('1');
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerHour, undefined),
      ).toEqual('2');
    });
  });

  describe('zipDiffBool', () => {
    it('should handle default', () => {
      expect(service.zipDiffBool(false, false)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffBool(undefined, false)).toEqual(ZNULL);
    });

    it('should handle true/false', () => {
      expect(service.zipDiffBool(false, true)).toEqual(ZFALSE);
      expect(service.zipDiffBool(true, false)).toEqual(ZTRUE);
    });
  });

  describe('zipDiffNullableArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffNullableArray(['a', 'b'], ['b', 'a'])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNullableArray(undefined, [])).toEqual(ZNULL);
      expect(service.zipDiffNullableArray([], undefined)).toEqual(ZEMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNullableArray(['b', 'a'], ['a', 'c'])).toEqual(
        'a~b',
      );
    });
  });

  describe('zipDiffNString', () => {
    it('should handle default', () => {
      expect(service.zipDiffNString('a', 'a', [])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNString(undefined, 'a', [])).toEqual(ZNULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNString('a', 'b', ['a'])).toEqual('A');
    });
  });

  describe('zipDiffNNumber', () => {
    it('should handle default', () => {
      expect(service.zipDiffNNumber(0, 0)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNNumber(undefined, 0)).toEqual(ZNULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNNumber(0, 1)).toEqual('A');
    });
  });

  describe('zipDiffNullableNArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffNullableNArray(['a', 'b'], ['b', 'a'], [])).toEqual(
        '',
      );
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNullableNArray(undefined, [], [])).toEqual(ZNULL);
      expect(service.zipDiffNullableNArray([], undefined, [])).toEqual(ZEMPTY);
    });

    it('should handle truthy', () => {
      expect(
        service.zipDiffNullableNArray(['b', 'a'], ['a', 'c'], ['a', 'b']),
      ).toEqual('A~B');
    });
  });

  describe('parseString', () => {
    it('should handle undefined', () => {
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseString(ZNULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseString('a')).toEqual('a');
    });
  });

  describe('parseBool', () => {
    it('should handle undefined', () => {
      expect(service.parseBool(undefined)).toBeUndefined();
      expect(service.parseBool('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseBool(ZNULL)).toBeUndefined();
    });

    it('should parse false', () => {
      expect(service.parseBool(ZFALSE)).toBeFalse();
    });

    it('should parse true', () => {
      expect(service.parseBool(ZTRUE)).toBeTrue();
    });
  });

  describe('parseNumber', () => {
    it('should handle undefined', () => {
      expect(service.parseNumber(undefined)).toBeUndefined();
      expect(service.parseNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNumber(ZNULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNumber('1')).toEqual(1);
    });
  });

  describe('parseDisplayRate', () => {
    it('should handle undefined', () => {
      expect(service.parseDisplayRate(undefined)).toBeUndefined();
      expect(service.parseDisplayRate('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseDisplayRate(ZNULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseDisplayRate('0')).toEqual(DisplayRate.PerSecond);
      expect(service.parseDisplayRate('1')).toEqual(DisplayRate.PerMinute);
      expect(service.parseDisplayRate('2')).toEqual(DisplayRate.PerHour);
    });

    it('should return null if unrecognized', () => {
      expect(service.parseDisplayRate('3')).toBeUndefined();
    });
  });

  describe('parseArray', () => {
    it('should handle undefined', () => {
      expect(service.parseArray(undefined)).toBeUndefined();
      expect(service.parseArray('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseArray(ZNULL)).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseArray(ZEMPTY)).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseArray('a~b')).toEqual(['a', 'b']);
    });
  });

  describe('parseNString', () => {
    it('should handle undefined', () => {
      expect(service.parseNString(undefined, [])).toBeUndefined();
      expect(service.parseNString('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNString(ZNULL, [])).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNString('A', ['a'])).toEqual('a');
    });
  });

  describe('parseNNumber', () => {
    it('should handle undefined', () => {
      expect(service.parseNNumber(undefined)).toBeUndefined();
      expect(service.parseNNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNNumber(ZNULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNNumber('A')).toEqual(0);
    });
  });

  describe('parseNArray', () => {
    it('should handle undefined', () => {
      expect(service.parseNArray(undefined, [])).toBeUndefined();
      expect(service.parseNArray('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNArray(ZNULL, [])).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseNArray(ZEMPTY, [])).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseNArray('A~B', ['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('parseNullableNArray', () => {
    it('should handle undefined', () => {
      expect(service.parseNullableNArray(undefined, [])).toBeUndefined();
      expect(service.parseNullableNArray('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNullableNArray(ZNULL, [])).toBeNull();
    });

    it('should parse empty', () => {
      expect(service.parseNullableNArray(ZEMPTY, [])).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseNullableNArray('A~B', ['a', 'b'])).toEqual([
        'a',
        'b',
      ]);
    });
  });
});
