import { Rational } from './rational';

describe('Rational', () => {
  describe('Static', () => {
    describe('gcd', () => {
      it('should calculate greatest common denominator', () => {
        expect(Rational.gcd(BigInt(8), BigInt(12))).toEqual(BigInt(4));
      });
    });

    describe('abs', () => {
      it('should deterine absolute value', () => {
        expect(Rational.abs(BigInt(2))).toEqual(BigInt(2));
        expect(Rational.abs(BigInt(-2))).toEqual(BigInt(2));
      });
    });

    describe('from', () => {
      it('should build a Rational from an integer Number', () => {
        expect(Rational.from(1, 3)).toEqual(new Rational(BigInt(1), BigInt(3)));
      });

      it('should throw a divide by zero error', () => {
        expect(() => Rational.from(1, 0)).toThrowError('Cannot divide by zero');
      });
    });

    describe('fromNumber', () => {
      it('should generate a Rational from integer', () => {
        expect(Rational.fromNumber(2)).toEqual(new Rational(BigInt(2)));
      });

      it('should generate a Rational from number', () => {
        expect(Rational.fromNumber(0.25)).toEqual(
          new Rational(BigInt(1), BigInt(4))
        );
      });
    });

    describe('fromString', () => {
      it('should generate a Rational from a decimal', () => {
        expect(Rational.fromString('0.5')).toEqual(Rational.from(1, 2));
      });

      it('should generate a Rational from a fraction', () => {
        expect(Rational.fromString('1/2')).toEqual(Rational.from(1, 2));
      });

      it('should generate a Rational from a mixed fraction', () => {
        expect(Rational.fromString('1 1/2')).toEqual(Rational.from(3, 2));
      });

      it('should throw on empty string', () => {
        expect(() => Rational.fromString('')).toThrowError('Empty string');
      });

      it('should throw on too many /', () => {
        expect(() => Rational.fromString('1/1/1')).toThrowError('Too many /');
      });

      it('should throw on too many spaces', () => {
        expect(() => Rational.fromString('1  1/2')).toThrowError(
          'Too many spaces'
        );
      });
    });

    describe('min', () => {
      it('should return the minimum of two Rationals', () => {
        expect(Rational.min(Rational.zero, Rational.one)).toEqual(
          Rational.zero
        );
        expect(Rational.min(Rational.one, Rational.zero)).toEqual(
          Rational.zero
        );
      });
    });

    describe('max', () => {
      it('should return the maximum of two Rationals', () => {
        expect(Rational.max(Rational.zero, Rational.one)).toEqual(Rational.one);
        expect(Rational.max(Rational.one, Rational.zero)).toEqual(Rational.one);
      });
    });
  });

  describe('Class', () => {
    describe('isZero', () => {
      it('should determine whether Rational is zero', () => {
        expect(Rational.zero.isZero()).toBeTrue();
        expect(Rational.one.isZero()).toBeFalse();
      });
    });

    describe('nonzero', () => {
      it('should determine whether Rational is nonzero', () => {
        expect(Rational.zero.nonzero()).toBeFalse();
        expect(Rational.one.nonzero()).toBeTrue();
      });
    });

    describe('isInteger', () => {
      it('should deterine whether Rational is an integer', () => {
        expect(Rational.one.isInteger()).toBeTrue();
        expect(Rational.one.div(Rational.two).isInteger()).toBeFalse();
      });
    });

    describe('inverse', () => {
      it('should inverse a number', () => {
        expect(Rational.zero.inverse()).toEqual(Rational.zero);
        expect(Rational.one.inverse()).toEqual(Rational.minusOne);
      });
    });

    describe('reciprocal', () => {
      it('should switch p and q', () => {
        expect(Rational.one.reciprocal()).toEqual(Rational.one);
        expect(Rational.two.reciprocal()).toEqual(Rational.from(1, 2));
      });
    });

    describe('lt', () => {
      it('should determine whether Rational is less than another', () => {
        expect(Rational.zero.lt(Rational.one)).toBeTrue();
        expect(Rational.one.lt(Rational.zero)).toBeFalse();
        expect(
          new Rational(BigInt(1), BigInt(3)).lt(
            new Rational(BigInt(3), BigInt(4))
          )
        ).toBeTrue();
      });
    });

    describe('lte', () => {
      it('should determine whether Rational is less than or equal to another', () => {
        expect(Rational.zero.lte(Rational.one)).toBeTrue();
        expect(Rational.zero.lte(Rational.zero)).toBeTrue();
        expect(Rational.one.lte(Rational.zero)).toBeFalse();
      });
    });

    describe('gt', () => {
      it('should determine whether Rational is less than another', () => {
        expect(Rational.zero.gt(Rational.one)).toBeFalse();
        expect(Rational.one.gt(Rational.zero)).toBeTrue();
      });
    });

    describe('gte', () => {
      it('should determine whether Rational is less than or equal to another', () => {
        expect(Rational.zero.gte(Rational.one)).toBeFalse();
        expect(Rational.zero.gte(Rational.zero)).toBeTrue();
        expect(Rational.one.gte(Rational.zero)).toBeTrue();
      });
    });

    describe('add', () => {
      it('should add two rationals', () => {
        expect(Rational.one.add(Rational.one)).toEqual(Rational.two);
      });

      it('should skip if adding zero', () => {
        expect(Rational.one.add(Rational.zero)).toBe(Rational.one);
      });
    });

    describe('sub', () => {
      it('should subtract two rationals', () => {
        expect(Rational.one.sub(Rational.one)).toEqual(Rational.zero);
      });

      it('should skip if subtracting zero', () => {
        expect(Rational.one.sub(Rational.zero)).toBe(Rational.one);
      });
    });

    describe('mul', () => {
      it('should multiply two rationals', () => {
        expect(Rational.two.mul(Rational.two)).toEqual(new Rational(BigInt(4)));
      });
    });

    describe('div', () => {
      it('should divide two rationals', () => {
        expect(Rational.two.div(Rational.two)).toEqual(Rational.one);
      });
    });

    describe('ceil', () => {
      it('should handle integers', () => {
        expect(Rational.from(2, 1).ceil()).toEqual(Rational.from(2, 1));
      });

      it('should handle fractions', () => {
        expect(Rational.from(3, 2).ceil()).toEqual(Rational.from(2, 1));
      });
    });

    describe('floor', () => {
      it('should handle integers', () => {
        expect(Rational.from(2, 1).floor()).toEqual(Rational.from(2, 1));
      });

      it('should handle fractions', () => {
        expect(Rational.from(3, 2).floor()).toEqual(Rational.one);
      });
    });

    describe('abs', () => {
      it('should deterine absolute value', () => {
        expect(Rational.from(2).abs()).toEqual(Rational.two);
        expect(Rational.from(-2).abs()).toEqual(Rational.two);
      });
    });

    describe('toNumber', () => {
      it('should convert to number', () => {
        expect(Rational.zero.toNumber()).toEqual(0);
        expect(Rational.one.toNumber()).toEqual(1);
        expect(Rational.two.toNumber()).toEqual(2);
      });
    });

    describe('toPrecision', () => {
      it('should round to precision', () => {
        expect(new Rational(BigInt(1), BigInt(3)).toPrecision(3)).toEqual(
          0.334
        );
      });

      it('should round fractions', () => {
        expect(Rational.from(11, 20).toPrecision(2)).toEqual(0.55);
      });
    });

    describe('toFraction', () => {
      it('should handle integers', () => {
        expect(Rational.two.toFraction()).toEqual('2');
      });

      it('should handle mixed', () => {
        expect(new Rational(BigInt(4), BigInt(3)).toFraction()).toEqual(
          '1 + 1/3'
        );
      });

      it('should handle fractions', () => {
        expect(new Rational(BigInt(1), BigInt(2)).toFraction()).toEqual('1/2');
      });
    });

    describe('toString', () => {
      it('should handle integers', () => {
        expect(Rational.one.toString()).toEqual('1');
      });

      it('should simplify a trivial fraction', () => {
        expect(Rational.from(1, 2).toString()).toEqual('0.5');
      });

      it('should handle fractions', () => {
        expect(Rational.from(1, 3).toString()).toEqual('1/3');
      });
    });

    describe('toDecimals', () => {
      it('should handle integers', () => {
        expect(Rational.one.toDecimals()).toEqual(0);
      });

      it('should determine number of decimals', () => {
        expect(Rational.one.div(Rational.two).toDecimals()).toEqual(1);
      });

      it('should handle invalid Rational', () => {
        expect(new Rational(BigInt(1), BigInt(0)).toDecimals()).toEqual(0);
      });
    });

    describe('constructor', () => {
      it('should handle negative quotient', () => {
        expect(new Rational(BigInt(1), BigInt(-1))).toEqual(
          new Rational(BigInt(-1))
        );
      });

      it('should simplify fraction', () => {
        expect(new Rational(BigInt(8), BigInt(12))).toEqual(
          new Rational(BigInt(2), BigInt(3))
        );
      });
    });
  });
});
