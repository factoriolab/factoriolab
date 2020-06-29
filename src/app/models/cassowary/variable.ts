/** Original source: https://github.com/IjzerenHein/kiwi.js/blob/master/src/variable.ts */

import { Rational } from '../rational';

/** The primary user constraint variable. */
export class Variable {
  private _value = Rational.zero;
  private _id: number = VarId++;

  /** Returns the unique id number of the variable. */
  public get id(): number {
    return this._id;
  }

  /** Returns the value of the variable. */
  public get value(): Rational {
    return this._value;
  }

  /** Set the value of the variable. */
  public set value(value: Rational) {
    this._value = value;
  }
}

/** The internal variable id counter. */
let VarId = 0;
