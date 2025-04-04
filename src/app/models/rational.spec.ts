import {
  abs,
  fromNumber,
  fromString,
  gcd,
  Rational,
  rational,
} from './rational';

describe('gcd', () => {
  it('should calculate greatest common denominator', () => {
    expect(gcd(8n, 12n)).toEqual(4n);
  });
});

describe('abs', () => {
  it('should deterine absolute value', () => {
    expect(abs(2n)).toEqual(2n);
    expect(abs(-2n)).toEqual(2n);
  });
});

describe('Rational', () => {
  describe('isZero', () => {
    it('should determine whether Rational is zero', () => {
      expect(rational(0n).isZero()).toBeTrue();
      expect(rational(1n).isZero()).toBeFalse();
    });
  });

  describe('nonzero', () => {
    it('should determine whether Rational is nonzero', () => {
      expect(rational(0n).nonzero()).toBeFalse();
      expect(rational(1n).nonzero()).toBeTrue();
    });
  });

  describe('isInteger', () => {
    it('should deterine whether Rational is an integer', () => {
      expect(rational(1n).isInteger()).toBeTrue();
      expect(rational(1n).div(new Rational(2n)).isInteger()).toBeFalse();
    });
  });

  describe('inverse', () => {
    it('should inverse a number', () => {
      expect(rational(0n).inverse()).toEqual(rational(0n));
      expect(rational(1n).inverse()).toEqual(new Rational(-1n));
    });
  });

  describe('reciprocal', () => {
    it('should switch p and q', () => {
      expect(rational(1n).reciprocal()).toEqual(rational(1n));
      expect(new Rational(2n).reciprocal()).toEqual(new Rational(1n, 2n));
    });
  });

  describe('lt', () => {
    it('should determine whether Rational is less than another', () => {
      expect(rational(0n).lt(rational(1n))).toBeTrue();
      expect(rational(1n).lt(rational(0n))).toBeFalse();
      expect(new Rational(1n, 3n).lt(new Rational(3n, 4n))).toBeTrue();
    });
  });

  describe('lte', () => {
    it('should determine whether Rational is less than or equal to another', () => {
      expect(rational(0n).lte(rational(1n))).toBeTrue();
      expect(rational(0n).lte(rational(0n))).toBeTrue();
      expect(rational(1n).lte(rational(0n))).toBeFalse();
    });
  });

  describe('gt', () => {
    it('should determine whether Rational is less than another', () => {
      expect(rational(0n).gt(rational(1n))).toBeFalse();
      expect(rational(1n).gt(rational(0n))).toBeTrue();
    });
  });

  describe('gte', () => {
    it('should determine whether Rational is less than or equal to another', () => {
      expect(rational(0n).gte(rational(1n))).toBeFalse();
      expect(rational(0n).gte(rational(0n))).toBeTrue();
      expect(rational(1n).gte(rational(0n))).toBeTrue();
    });
  });

  describe('add', () => {
    it('should add two rationals', () => {
      expect(rational(1n).add(rational(1n))).toEqual(new Rational(2n));
    });

    it('should skip if adding zero', () => {
      expect(rational(1n).add(rational(0n))).toEqual(rational(1n));
    });
  });

  describe('sub', () => {
    it('should subtract two rationals', () => {
      expect(rational(1n).sub(rational(1n))).toEqual(rational(0n));
    });

    it('should skip if subtracting zero', () => {
      expect(rational(1n).sub(rational(0n))).toEqual(rational(1n));
    });
  });

  describe('mul', () => {
    it('should multiply two rationals', () => {
      expect(new Rational(2n).mul(new Rational(2n))).toEqual(new Rational(4n));
    });
  });

  describe('div', () => {
    it('should divide two rationals', () => {
      expect(new Rational(2n).div(new Rational(2n))).toEqual(rational(1n));
    });
  });

  describe('ceil', () => {
    it('should handle integers', () => {
      expect(rational(2, 1).ceil()).toEqual(rational(2, 1));
    });

    it('should handle fractions', () => {
      expect(rational(3, 2).ceil()).toEqual(rational(2, 1));
    });

    it('should handle small negative values', () => {
      expect(rational(-1, 10).ceil()).toEqual(new Rational(-1n));
    });
  });

  describe('floor', () => {
    it('should handle integers', () => {
      expect(rational(2, 1).floor()).toEqual(rational(2, 1));
    });

    it('should handle fractions', () => {
      expect(rational(3, 2).floor()).toEqual(rational(1n));
    });
  });

  describe('trunc', () => {
    it('should truncate towards zero', () => {
      expect(rational(12345, 10000).trunc(3)).toEqual(rational(617n, 500n));
      expect(rational(-12345, 10000).trunc(3)).toEqual(rational(-617n, 500n));
    });
  });

  describe('round', () => {
    it('should round integers or up/down', () => {
      expect(rational(2n).round()).toEqual(rational(2n));
      expect(rational(2n, 3n).round()).toEqual(rational(1n));
      expect(rational(4n, 3n).round()).toEqual(rational(1n));
    });
  });

  describe('abs', () => {
    it('should deterine absolute value', () => {
      expect(rational(2).abs()).toEqual(new Rational(2n));
      expect(rational(-2).abs()).toEqual(new Rational(2n));
    });
  });

  describe('toNumber', () => {
    it('should convert to number', () => {
      expect(rational(0n).toNumber()).toEqual(0);
      expect(rational(1n).toNumber()).toEqual(1);
      expect(new Rational(2n).toNumber()).toEqual(2);
    });
  });

  describe('toPrecision', () => {
    it('should round to precision', () => {
      expect(new Rational(1n, 3n).toPrecision(3)).toEqual(0.334);
    });

    it('should round fractions', () => {
      expect(rational(11, 20).toPrecision(2)).toEqual(0.55);
    });
  });

  describe('toFraction', () => {
    it('should handle integers', () => {
      expect(new Rational(2n).toFraction()).toEqual('2');
    });

    it('should handle mixed', () => {
      expect(new Rational(4n, 3n).toFraction()).toEqual('1 + 1/3');
    });

    it('should handle fractions', () => {
      expect(new Rational(1n, 2n).toFraction()).toEqual('1/2');
    });
  });

  describe('toString', () => {
    it('should handle integers', () => {
      expect(rational(1n).toString()).toEqual('1');
    });

    it('should simplify a trivial fraction', () => {
      expect(rational(1, 2).toString()).toEqual('0.5');
    });

    it('should handle fractions', () => {
      expect(rational(1, 3).toString()).toEqual('1/3');
    });

    it('should handle very small numbers', () => {
      expect(rational(3, 10000000).toString()).toEqual('3/10000000');
    });

    it('should use specified precision', () => {
      expect(rational(1, 3).toString(2)).toEqual('0.34');
    });
  });

  describe('toDecimals', () => {
    it('should handle integers', () => {
      expect(rational(1n).toDecimals()).toEqual(0);
    });

    it('should determine number of decimals', () => {
      expect(rational(1n).div(new Rational(2n)).toDecimals()).toEqual(1);
    });

    it('should handle very small numbers', () => {
      expect(rational(3, 10000000).toDecimals()).toEqual(7);
    });

    it('should handle large numbers', () => {
      expect(rational(2000001, 100000).toDecimals()).toEqual(5);
    });
  });

  describe('toJson', () => {
    it('should alias toString', () => {
      const value = rational(1n);
      spyOn(value, 'toString');
      value.toJSON();
      expect(value.toString).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should handle negative quotient', () => {
      expect(new Rational(1n, -1n)).toEqual(new Rational(-1n));
    });

    it('should simplify fraction', () => {
      expect(new Rational(8n, 12n)).toEqual(new Rational(2n, 3n));
    });

    it('should throw on zero quotient', () => {
      expect(() => new Rational(1n, 0n)).toThrow();
    });
  });
});

describe('fromNumber', () => {
  it('should generate a Rational from integer', () => {
    expect(fromNumber(2)).toEqual(new Rational(2n));
  });

  it('should generate a Rational from number', () => {
    expect(fromNumber(0.25)).toEqual(new Rational(1n, 4n));
    expect(fromNumber(0.007342528014038914)).toEqual(
      new Rational(8000n, 1089543n),
    );
    // Test known number to hit alternate solution in `fromFloat`
    expect(fromNumber(0.00734252802)).toEqual(new Rational(68827n, 9373747n));
  });

  it('should return zero for numbers below float tolerance', () => {
    expect(fromNumber(Number.MIN_VALUE)).toEqual(rational(0n));
  });
});

describe('fromString', () => {
  it('should generate a Rational from a decimal', () => {
    expect(fromString('0.5')).toEqual(new Rational(1n, 2n));
  });

  it('should generate a Rational from a fraction', () => {
    expect(fromString('1/2')).toEqual(new Rational(1n, 2n));
  });

  it('should generate a Rational from a mixed fraction', () => {
    expect(fromString('1 1/2')).toEqual(new Rational(3n, 2n));
  });

  it('should throw on empty string', () => {
    expect(() => fromString('')).toThrowError('Empty string');
  });

  it('should throw on too many /', () => {
    expect(() => fromString('1/1/1')).toThrowError('Too many /');
  });

  it('should throw on too many spaces', () => {
    expect(() => fromString('1  1/2')).toThrowError('Too many spaces');
  });

  it('should evaluate an equation', () => {
    expect(fromString('=1+1')).toEqual(new Rational(2n));
  });
});

describe('rational', () => {
  it('should build a Rational from an integer Number', () => {
    expect(rational(1, 3)).toEqual(new Rational(1n, 3n));
  });

  it('should throw a divide by zero error', () => {
    expect(() => rational(1, 0)).toThrowError('Cannot divide by zero');
  });
});
