import { Rational } from '../rational';
import { Constraint, Operator } from './constraint';
import { Expression } from './expression';
import { Solver } from './solver';
import { Strength } from './strength';
import { Variable } from './variable';

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

    it('should add a le constraint', () => {
      solver.addConstraint(
        new Constraint(
          new Expression(new Variable()),
          Operator.Le,
          Strength.medium
        )
      );
      expect(solver.constraints.length).toEqual(1);
      expect(solver.variables.length).toEqual(0);
    });

    it('should add a ge constraint', () => {
      solver.addConstraint(
        new Constraint(new Expression(new Variable()), Operator.Ge)
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

  describe('addEditVariable', () => {
    it('should add an edit variable', () => {
      solver.addEditVariable(new Variable(), Strength.weak);
      expect(solver.constraints.length).toEqual(1);
      expect(solver.variables.length).toEqual(1);
    });

    it('should throw for duplicate variable', () => {
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      expect(() =>
        solver.addEditVariable(variable, Strength.medium)
      ).toThrowError('Duplicate edit variable');
    });

    it('should throw error for required strength', () => {
      expect(() =>
        solver.addEditVariable(new Variable(), Strength.required)
      ).toThrowError('Bad required strength');
    });
  });

  describe('suggestValue', () => {
    const infeasibleRows = '_infeasibleRows';

    it('should optimize a variable for a value', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.suggestValue(variable, Rational.one);
      expect(solver[infeasibleRows].length).toEqual(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should throw for unknown variable', () => {
      expect(() =>
        solver.suggestValue(new Variable(), Rational.one)
      ).toThrowError('Unknown edit variable');
    });

    it('should handle basic positive error variable', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable, Rational.minusOne), Operator.Eq)
      );
      solver.suggestValue(variable, Rational.one);
      expect(solver[infeasibleRows].length).toEqual(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle basic positive error variable', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable, Rational.minusOne), Operator.Eq)
      );
      solver.suggestValue(variable, Rational.two);
      expect(solver[infeasibleRows].length).toEqual(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle basic negative error variable', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable, Rational.one), Operator.Eq)
      );
      solver.suggestValue(variable, Rational.one);
      expect(solver[infeasibleRows].length).toEqual(0);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle infeasible negative error variable', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable, Rational.one), Operator.Eq)
      );
      solver.suggestValue(variable, new Rational(BigInt(-2)));
      expect(solver[infeasibleRows].length).toEqual(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should handle other rows where error variables exist', () => {
      const spy = spyOn<any>(solver, '_dualOptimize');
      const rowMap = '_rowMap';
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        second: {
          coefficientFor: () => Rational.one,
          add: () => Rational.minusOne,
        },
        first: { type: 0 },
      });
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.suggestValue(variable, Rational.one);
      expect(solver[infeasibleRows].length).toEqual(1);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateVariables', () => {
    it('should update variable values', () => {
      const variable = new Variable();
      solver.addEditVariable(variable, Strength.weak);
      solver.addConstraint(
        new Constraint(new Expression(variable, Rational.minusOne), Operator.Eq)
      );
      solver.updateVariables();
      expect(variable.value).toEqual(Rational.one);
    });

    it('should handle undefined variables', () => {
      const pair: any = { first: { value: Rational.one }, second: {} };
      const varMap = '_varMap';
      solver[varMap].array.push(pair);
      solver.updateVariables();
      expect(pair.first.value).toEqual(Rational.zero);
    });
  });

  describe('_chooseSubject', () => {
    const chooseSubject = '_chooseSubject';

    it('should return first from pair for external symbols', () => {
      const pair: any = { first: { type: 1 } };
      const row: any = {
        cells: { size: () => 1, itemAt: () => pair },
      };
      const result = solver[chooseSubject](row, null);
      expect(result).toEqual(pair.first);
    });

    it('should return marker for error symbols with coefficient lt zero', () => {
      const row: any = {
        cells: { size: () => 0 },
        coefficientFor: () => Rational.minusOne,
      };
      const tag: any = { marker: { type: 3 } };
      const result = solver[chooseSubject](row, tag);
      expect(result).toEqual(tag.marker);
    });

    it('should return other for error symbols with coefficient lt zero', () => {
      const row: any = {
        cells: { size: () => 0 },
        coefficientFor: () => Rational.minusOne,
      };
      const tag: any = { marker: { type: 0 }, other: { type: 3 } };
      const result = solver[chooseSubject](row, tag);
      expect(result).toEqual(tag.other);
    });

    it('should return invalid symbol if coeffients not lt zero', () => {
      const row: any = {
        cells: { size: () => 0 },
        coefficientFor: () => Rational.one,
      };
      const tag: any = { marker: { type: 3 }, other: { type: 3 } };
      const result = solver[chooseSubject](row, tag);
      expect(result.id).toEqual(-1);
    });

    it('should return invalid symbol if subject cannot be found', () => {
      const pair: any = { first: { type: 0 } };
      const row: any = {
        cells: { size: () => 1, itemAt: () => pair },
      };
      const tag: any = { marker: { type: 0 }, other: { type: 0 } };
      const result = solver[chooseSubject](row, tag);
      expect(result.id).toEqual(-1);
    });
  });

  describe('_addWithArtificialVariable', () => {
    const addWithArtificialVariable = '_addWithArtificialVariable';
    const rowMap = '_rowMap';
    const objective = '_objective';

    it('should add artificial variable', () => {
      const row: any = { copy: () => ({ constant: Rational.zero }) };
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      const spyOptimize = spyOn<any>(solver, '_optimize');
      const spyObjectiveRemoveSymbol = spyOn<any>(
        solver[objective],
        'removeSymbol'
      );
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        second: { removeSymbol: () => {} },
      });
      spyOn<any>(solver[rowMap], 'erase').and.returnValue(undefined);
      const result = solver[addWithArtificialVariable](row);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(1);
      expect(spyOptimize).toHaveBeenCalledTimes(1);
      expect(spyObjectiveRemoveSymbol).toHaveBeenCalledTimes(1);
      expect(result).toBeTrue();
    });

    it('should handle basic artificial variable with a constant row', () => {
      const row: any = { copy: () => ({ constant: Rational.zero }) };
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      const spyOptimize = spyOn<any>(solver, '_optimize');
      const spyObjectiveRemoveSymbol = spyOn<any>(
        solver[objective],
        'removeSymbol'
      );
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        second: { removeSymbol: () => {} },
      });
      spyOn<any>(solver[rowMap], 'erase').and.returnValue({
        second: { isConstant: () => true },
      });
      const result = solver[addWithArtificialVariable](row);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(1);
      expect(spyOptimize).toHaveBeenCalledTimes(1);
      expect(spyObjectiveRemoveSymbol).not.toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    it('should handle artificial with row and invalid entering type', () => {
      const row: any = { copy: () => ({ constant: Rational.zero }) };
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      const spyOptimize = spyOn<any>(solver, '_optimize');
      const spyObjectiveRemoveSymbol = spyOn<any>(
        solver[objective],
        'removeSymbol'
      );
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        second: { removeSymbol: () => {} },
      });
      spyOn<any>(solver[rowMap], 'erase').and.returnValue({
        second: { isConstant: () => false },
      });
      spyOn<any>(solver, '_anyPivotableSymbol').and.returnValue({ type: 0 });
      const result = solver[addWithArtificialVariable](row);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(1);
      expect(spyOptimize).toHaveBeenCalledTimes(1);
      expect(spyObjectiveRemoveSymbol).not.toHaveBeenCalled();
      expect(result).toBeFalse();
    });

    it('should pivot artificial variable row', () => {
      const row: any = { copy: () => ({ constant: Rational.zero }) };
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      const spyOptimize = spyOn<any>(solver, '_optimize');
      const spySubstitute = spyOn<any>(solver, '_substitute');
      const spyObjectiveRemoveSymbol = spyOn<any>(
        solver[objective],
        'removeSymbol'
      );
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        second: { removeSymbol: () => {} },
      });
      spyOn<any>(solver[rowMap], 'erase').and.returnValue({
        second: { isConstant: () => false, solveForEx: () => {} },
      });
      spyOn<any>(solver, '_anyPivotableSymbol').and.returnValue({ type: 1 });
      const result = solver[addWithArtificialVariable](row);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(2);
      expect(spyOptimize).toHaveBeenCalledTimes(1);
      expect(spySubstitute).toHaveBeenCalledTimes(1);
      expect(spyObjectiveRemoveSymbol).toHaveBeenCalledTimes(1);
      expect(result).toBeTrue();
    });
  });

  describe('_substitute', () => {
    const substitute = '_substitute';
    const rowMap = '_rowMap';
    const objective = '_objective';
    const infeasibleRows = '_infeasibleRows';

    it('should handle infeasible rows', () => {
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue({
        first: { type: 0 },
        second: { substitute: () => {}, constant: Rational.minusOne },
      });
      const spyObjectiveSubstitute = spyOn<any>(
        solver[objective],
        'substitute'
      );
      solver[substitute](null, null);
      expect(solver[infeasibleRows].length).toEqual(1);
      expect(spyObjectiveSubstitute).toHaveBeenCalledTimes(1);
    });
  });

  describe('_optimize', () => {
    const optimize = '_optimize';

    it('should throw if objective is unbounded', () => {
      spyOn<any>(solver, '_getEnteringSymbol').and.returnValue({ type: 1 });
      spyOn<any>(solver, '_getLeavingSymbol').and.returnValue({ type: 0 });
      expect(() => solver[optimize](null)).toThrowError(
        'The objective is unbounded'
      );
    });
  });

  describe('_dualOptimize', () => {
    const dualOptimize = '_dualOptimize';
    const rowMap = '_rowMap';
    const infeasibleRows = '_infeasibleRows';

    it('should skip for undefined pair', () => {
      const spyRowMapErase = spyOn<any>(solver[rowMap], 'erase');
      const spySubstitute = spyOn<any>(solver, '_substitute');
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      spyOn<any>(solver[rowMap], 'find').and.returnValue(undefined);
      const infeasibleRow: any = {};
      solver[infeasibleRows] = [infeasibleRow];
      solver[dualOptimize]();
      expect(spyRowMapErase).toHaveBeenCalledTimes(0);
      expect(spySubstitute).toHaveBeenCalledTimes(0);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(0);
    });

    it('should optimize the system for a pair', () => {
      const spyRowMapErase = spyOn<any>(solver[rowMap], 'erase');
      const spySubstitute = spyOn<any>(solver, '_substitute');
      const spyRowMapInsert = spyOn<any>(solver[rowMap], 'insert');
      const pair: any = {
        second: { constant: Rational.minusOne, solveForEx: () => {} },
      };
      spyOn(pair.second, 'solveForEx');
      spyOn<any>(solver[rowMap], 'find').and.returnValue(pair);
      spyOn<any>(solver, '_getDualEnteringSymbol').and.returnValue({ type: 1 });
      const infeasibleRow: any = {};
      solver[infeasibleRows] = [infeasibleRow];
      solver[dualOptimize]();
      expect(spyRowMapErase).toHaveBeenCalledTimes(1);
      expect(pair.second.solveForEx).toHaveBeenCalledTimes(1);
      expect(spySubstitute).toHaveBeenCalledTimes(1);
      expect(spyRowMapInsert).toHaveBeenCalledTimes(1);
    });

    it('should throw for invalid entering symbol', () => {
      const pair: any = {
        second: { constant: Rational.minusOne },
      };
      spyOn<any>(solver[rowMap], 'find').and.returnValue(pair);
      spyOn<any>(solver, '_getDualEnteringSymbol').and.returnValue({ type: 0 });
      const infeasibleRow: any = {};
      solver[infeasibleRows] = [infeasibleRow];
      expect(() => solver[dualOptimize]()).toThrowError('Dual optimize failed');
    });
  });

  describe('_getDualEnteringSymbol', () => {
    const getDualEnteringSymbol = '_getDualEnteringSymbol';
    const objective = '_objective';

    it('should compute the entering symbol', () => {
      spyOn<any>(solver[objective], 'coefficientFor').and.returnValue(
        Rational.one
      );
      const pair: any = { first: { type: 0 }, second: Rational.one };
      const row: any = { cells: { size: () => 1, itemAt: () => pair } };
      const result = solver[getDualEnteringSymbol](row);
      expect(result).toEqual(pair.first);
    });

    it('should skip dummy symbols', () => {
      const pair: any = { first: { type: 4 }, second: Rational.one };
      const row: any = { cells: { size: () => 1, itemAt: () => pair } };
      const result = solver[getDualEnteringSymbol](row);
      expect(result.id).toEqual(-1);
    });

    it('should skip if divide by zero occurs', () => {
      spyOn<any>(solver[objective], 'coefficientFor').and.returnValue(
        Rational.fromNumber(Number.MAX_VALUE).add(Rational.one)
      );
      const pair: any = { first: { type: 0 }, second: Rational.one };
      const row: any = { cells: { size: () => 1, itemAt: () => pair } };
      const result = solver[getDualEnteringSymbol](row);
      expect(result.id).toEqual(-1);
    });
  });

  describe('_getLeavingSymbol', () => {
    const getLeavingSymbol = '_getLeavingSymbol';
    const rowMap = '_rowMap';
    const objective = '_objective';

    it('should get the leaving symbol', () => {
      const pair: any = {
        first: { type: 0 },
        second: {
          coefficientFor: () => Rational.minusOne,
          constant: Rational.one,
        },
      };
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue(pair);
      const result = solver[getLeavingSymbol](null);
      expect(result).toEqual(pair.first);
    });

    it('should skip if divide by zero occurs', () => {
      const pair: any = {
        first: { type: 0 },
        second: {
          coefficientFor: () => Rational.minusOne,
          constant: Rational.fromNumber(Number.MAX_VALUE).add(Rational.one),
        },
      };
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue(pair);
      const result = solver[getLeavingSymbol](null);
      expect(result.id).toEqual(-1);
    });

    it('should skip if coefficient gt zero', () => {
      const pair: any = {
        first: { type: 0 },
        second: {
          coefficientFor: () => Rational.one,
        },
      };
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue(pair);
      const result = solver[getLeavingSymbol](null);
      expect(result.id).toEqual(-1);
    });

    it('should skip if symbol is external type', () => {
      const pair: any = {
        first: { type: 1 },
      };
      spyOn<any>(solver[rowMap], 'size').and.returnValue(1);
      spyOn<any>(solver[rowMap], 'itemAt').and.returnValue(pair);
      const result = solver[getLeavingSymbol](null);
      expect(result.id).toEqual(-1);
    });
  });

  describe('_anyPivotableSymbol', () => {
    const anyPivotableSymbol = '_anyPivotableSymbol';

    it('should get the first error symbol in the row', () => {
      const pair: any = { first: { type: 3 } };
      const row: any = { cells: { size: () => 1, itemAt: () => pair } };
      const result = solver[anyPivotableSymbol](row);
      expect(result).toEqual(pair.first);
    });

    it('should return undefined symbol if no slack/error symbols are found', () => {
      const pair: any = { first: { type: 0 } };
      const row: any = { cells: { size: () => 1, itemAt: () => pair } };
      const result = solver[anyPivotableSymbol](row);
      expect(result.id).toEqual(-1);
    });
  });

  describe('Row', () => {
    describe('coefficientFor', () => {
      it('should handle missing symbol', () => {
        solver.addEditVariable(new Variable(), Strength.weak);
        const row = solver.rows[0];
        const symbol: any = { id: 10 };
        const result = row.second.coefficientFor(symbol);
        expect(result).toEqual(Rational.zero);
      });
    });
  });
});
