import { Constraint, Operator } from './constraint';
import { Expression } from './expression';
import { Solver } from './solver';
import { Variable } from './variable';
import { Rational } from './rational';

describe('Solver', () => {
  let solver: Solver;

  beforeEach(() => {
    solver = new Solver();
  });

  describe('addConstraint', () => {
    it('should add a constraint', () => {
      solver.addConstraint(
        new Constraint(new Expression(new Variable()), Operator.Eq)
      );
      expect(solver.constraints.length).toEqual(1);
      expect(solver.variables.length).toEqual(0);
    });

    it('should handle a row of dummy variables', () => {
      solver.addConstraint(
        new Constraint(
          new Expression([Rational.zero, new Variable()]),
          Operator.Eq
        )
      );
      expect(solver.constraints.length).toEqual(1);
      expect(solver.variables.length).toEqual(0);
    });

    it('should add an artificial variable', () => {
      solver.addConstraint(
        new Constraint(new Expression([Rational.zero, new Variable()]), 4)
      );
      expect(solver.constraints.length).toEqual(1);
      expect(solver.variables.length).toEqual(0);
    });

    it('should throw for duplicate constraint', () => {
      const constraint = new Constraint(
        new Expression(new Variable()),
        Operator.Eq
      );
      solver.addConstraint(constraint);
      expect(() => solver.addConstraint(constraint)).toThrowError(
        'Duplicate constraint'
      );
    });

    it('should throw for a row of nonzero dummy variables', () => {
      expect(() =>
        solver.addConstraint(
          new Constraint(
            new Expression([Rational.zero, new Variable()]).plus(Rational.one),
            Operator.Eq
          )
        )
      ).toThrowError('Unsatisfiable constraint');
    });

    it('should throw for an unsatisfiable constraint', () => {
      spyOn<any>(solver, '_addWithArtificialVariable').and.returnValue(false);
      expect(() =>
        solver.addConstraint(
          new Constraint(new Expression([Rational.zero, new Variable()]), 4)
        )
      ).toThrowError('Unsatisfiable constraint');
    });
  });
});
