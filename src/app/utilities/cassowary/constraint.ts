import { Expression } from './expression';
import { Strength } from './strength';
import { Variable } from './variable';

/**
 * An enum defining the linear constraint operators.
 *
 * |Value|Operator|Description|
 * |----|-----|-----|
 * |`Le`|<=|Less than equal|
 * |`Ge`|>=|Greater than equal|
 * |`Eq`|==|Equal|
 */
export enum Operator {
  Le, // <=
  Ge, // >=
  Eq, // ==
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
  private _strength: number;
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
    rhs?: Expression | Variable | number,
    strength: number = Strength.required
  ) {
    this._operator = operator;
    this._strength = Strength.clip(strength);
    if (rhs === undefined && expression instanceof Expression) {
      this._expression = expression;
    } else {
      const tempExpression = new Expression(expression);
      this._expression = tempExpression.minus(rhs);
    }
  }

  /** Returns the unique id number of the constraint. */
  public id(): number {
    return this._id;
  }

  /** Returns the expression of the constraint. */
  public expression(): Expression {
    return this._expression;
  }

  /** Returns the relational operator of the constraint. */
  public op(): Operator {
    return this._operator;
  }

  /** Returns the strength of the constraint. */
  public strength(): number {
    return this._strength;
  }

  public toString(): string {
    return (
      this._expression.toString() +
      ' ' +
      ['<=', '>=', '='][this._operator] +
      ' 0 (' +
      this._strength.toString() +
      ')'
    );
  }
}

/** The internal constraint id counter. */
let CnId = 0;
