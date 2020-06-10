import { createMap, IMap } from './maptype';
import { Rational } from './rational';
import { Variable } from './variable';

/**
 * An expression of variable terms and a constant.
 *
 * The constructor accepts an arbitrary number of parameters,
 * each of which must be one of the following types:
 *  - Rational
 *  - Variable
 *  - Expression
 *  - 2-tuple of [Rational, Variable|Expression]
 *
 * The parameters are summed. The tuples are multiplied.
 */
export class Expression {
  private _terms: IMap<Variable, Rational>;
  private _constant: Rational;

  constructor(...args: any[]);
  constructor() {
    const parsed = parseArgs(arguments);
    this._terms = parsed.terms;
    this._constant = parsed.constant;
  }

  /** Returns the mapping of terms in the expression. This *must* be treated as const. */
  public terms(): IMap<Variable, Rational> {
    return this._terms;
  }

  /** Returns the constant of the expression. */
  public constant(): Rational {
    return this._constant;
  }

  /** Returns the computed value of the expression. */
  public value(): Rational {
    let result = this._constant;
    for (let i = 0, n = this._terms.size(); i < n; i++) {
      const pair = this._terms.itemAt(i);
      result = result.add(pair.first.value().mul(pair.second));
    }
    return result;
  }

  /**
   * Creates a new Expression by adding a rational, variable or expression to the expression.
   *
   * @param value Value to add.
   */
  public plus(value: Rational | Variable | Expression): Expression {
    return new Expression(this, value);
  }

  /**
   * Creates a new Expression by substracting a rational, variable or expression from the expression.
   *
   * @param value Value to subtract.
   */
  public minus(value: Rational | Variable | Expression): Expression {
    return new Expression(
      this,
      value instanceof Rational ? value.inverse() : [Rational.minusOne, value]
    );
  }

  /**
   * Creates a new Expression by multiplying with a rational.
   *
   * @param coefficient Coefficient to multiply with.
   */
  public multiply(coefficient: Rational): Expression {
    return new Expression([coefficient, this]);
  }

  /** Creates a new Expression by dividing with a rational.
   *
   * @param coefficient Coefficient to divide by.
   */
  public divide(coefficient: Rational): Expression {
    return new Expression([Rational.one.div(coefficient), this]);
  }

  public isConstant(): boolean {
    return this._terms.size() === 0;
  }

  public toString(): string {
    let result = this._terms.array
      .map((pair) => {
        return pair.second + '*' + pair.first.toString();
      })
      .join(' + ');

    if (!this.isConstant() && this._constant.nonzero()) {
      result += ' + ';
    }

    result += this._constant;

    return result;
  }
}

/** An internal interface for the argument parse results. */
interface IParseResult {
  terms: IMap<Variable, Rational>;
  constant: Rational;
}

/** An internal argument parsing function. */
function parseArgs(args: IArguments): IParseResult {
  let constant = Rational.zero;
  const factory = () => Rational.zero;
  const terms = createMap<Variable, Rational>();
  for (let i = 0, n = args.length; i < n; ++i) {
    const item = args[i];
    if (item instanceof Rational) {
      constant = constant.add(item);
    } else if (item instanceof Variable) {
      const termDefault = terms.setDefault(item, factory);
      termDefault.second = termDefault.second.add(Rational.one);
    } else if (item instanceof Expression) {
      constant = constant.add(item.constant());
      const terms2 = item.terms();
      for (let j = 0, k = terms2.size(); j < k; j++) {
        const termPair = terms2.itemAt(j);
        const termDefault = terms.setDefault(termPair.first, factory);
        termDefault.second = termDefault.second.add(termPair.second);
      }
    } else if (item instanceof Array) {
      if (item.length !== 2) {
        throw new Error('array must have length 2');
      }
      const value: Rational = item[0];
      const value2 = item[1];
      if (!(value instanceof Rational)) {
        throw new Error('array item 0 must be a Rational');
      }
      if (value2 instanceof Variable) {
        const termDefault = terms.setDefault(value2, factory);
        termDefault.second = termDefault.second.add(value);
      } else if (value2 instanceof Expression) {
        constant = constant.add(value2.constant().mul(value));
        const terms2 = value2.terms();
        for (let j = 0, k = terms2.size(); j < k; j++) {
          const termPair = terms2.itemAt(j);
          const termDefault = terms.setDefault(termPair.first, factory);
          termDefault.second = termDefault.second.add(
            termPair.second.mul(value)
          );
        }
      } else {
        throw new Error('array item 1 must be a variable or expression');
      }
    } else {
      throw new Error('invalid Expression argument: ' + item);
    }
  }
  return { terms, constant };
}
