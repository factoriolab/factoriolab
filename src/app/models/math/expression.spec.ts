import { Expression } from './expression';
import { Rational } from './rational';
import { Variable } from './variable';

describe('Expression', () => {
  let expression: Expression;

  beforeEach(() => {
    expression = new Expression();
  });

  describe('plus', () => {
    it('should return a new expression adding the value', () => {
      const result = expression.plus(Rational.one);
      expect(result).toEqual(new Expression(expression, Rational.one));
    });
  });

  describe('minus', () => {
    it('should return a new expression subtracting a Rational', () => {
      const result = expression.minus(Rational.one);
      expect(result).toEqual(new Expression(expression, Rational.minusOne));
    });

    it('should return a new expression subtracting a term', () => {
      const x = new Variable();
      const result = expression.minus(x);
      expect(result).toEqual(
        new Expression(expression, [Rational.minusOne, x])
      );
    });
  });

  describe('isConstant', () => {
    it('should determine whether the expression is a constant', () => {
      expect(expression.isConstant()).toBeTrue();
      expect(expression.plus(new Variable()).isConstant()).toBeFalse();
    });
  });

  describe('parseArgs', () => {
    it('should handle Rational', () => {
      const ex = new Expression(Rational.one);
      expect(ex.terms.size()).toEqual(0);
      expect(ex.constant).toEqual(Rational.one);
    });

    it('should handle Variable', () => {
      const ex = new Expression(new Variable());
      expect(ex.terms.size()).toEqual(1);
      expect(ex.constant).toEqual(Rational.zero);
    });

    it('should handle Expression', () => {
      const ex = new Expression(new Expression(new Variable(), Rational.one));
      expect(ex.terms.size()).toEqual(1);
      expect(ex.constant).toEqual(Rational.one);
    });

    it('should handle Array', () => {
      const ex = new Expression([Rational.one, new Variable()]);
      expect(ex.terms.size()).toEqual(1);
      expect(ex.constant).toEqual(Rational.zero);
    });

    it('should handle Array with Expression', () => {
      const ex = new Expression([
        Rational.one,
        new Expression(new Variable(), Rational.one),
      ]);
      expect(ex.terms.size()).toEqual(1);
      expect(ex.constant).toEqual(Rational.one);
    });

    it('should throw for Array with length other than 2', () => {
      expect(() => new Expression([])).toThrowError('Array must have length 2');
    });

    it('should throw for Array where item 0 is not a Rational', () => {
      expect(() => new Expression([0, 0])).toThrowError(
        'Array item 0 must be a Rational'
      );
    });

    it('should throw for Array where item 1 is not a Variable/Expression', () => {
      expect(() => new Expression([Rational.one, 0])).toThrowError(
        'Array item 1 must be a Variable or Expression'
      );
    });

    it('should throw for unexpected argument type', () => {
      expect(() => new Expression(0)).toThrowError(
        'Invalid Expression argument: 0'
      );
    });
  });
});
