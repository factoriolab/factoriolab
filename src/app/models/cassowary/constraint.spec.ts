import { Constraint, Operator } from './constraint';
import { Expression } from './expression';
import { Variable } from './variable';
import { Strength } from './strength';

describe('Constraint', () => {
  describe('constructor', () => {
    it('should create a new constraint from an expression', () => {
      const expression = new Expression(new Variable());
      const result = new Constraint(expression, Operator.Eq);
      expect(result.id).toBeGreaterThanOrEqual(0);
      expect(result.expression).toBe(expression);
      expect(result.op).toBe(Operator.Eq);
      expect(result.strength).toEqual(Strength.required);
    });

    it('should create a new constraint from a variable', () => {
      const variable = new Variable();
      const result = new Constraint(variable, Operator.Eq);
      expect(result.id).toBeGreaterThanOrEqual(0);
      expect(result.expression).toEqual(new Expression(variable));
      expect(result.op).toBe(Operator.Eq);
      expect(result.strength).toEqual(Strength.required);
    });
  });
});
