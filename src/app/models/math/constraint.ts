import { Expression } from './expression';
import { Rational } from './rational';
import { Strength } from './strength';
import { Variable } from './variable';

export enum Operator {
  /** Less than or equal */
  Le,
  /** Greater than or equal */
  Ge,
  /** Equal */
  Eq,
}

/**
 * A linear constraint equation.
 *
 * A constraint equation is composed of an expression, an operator,
 * and a strength. The RHS of the equation is implicitly zero.
 */
export class Constraint {
  private _expression: Expression;
  private _operator: Operator;
  private _strength: Rational;
  private _id: number = CnId++;

  /**
   * @param expression The constraint expression (LHS).
   * @param operator The equation operator.
   * @param rhs Right hand side of the expression.
   * @param strength The strength of the constraint.
   */
  constructor(
    expression: Expression | Variable,
    operator: Operator,
    strength: Rational = Strength.required
  ) {
    this._operator = operator;
    this._strength = Strength.clip(strength);
    if (expression instanceof Expression) {
      this._expression = expression;
    } else {
      this._expression = new Expression(expression);
    }
  }

  /** Returns the unique id number of the constraint. */
  public get id(): number {
    return this._id;
  }

  /** Returns the expression of the constraint. */
  public get expression(): Expression {
    return this._expression;
  }

  /** Returns the relational operator of the constraint. */
  public get op(): Operator {
    return this._operator;
  }

  /** Returns the strength of the constraint. */
  public get strength(): Rational {
    return this._strength;
  }
}

/** The internal constraint id counter. */
let CnId = 0;
