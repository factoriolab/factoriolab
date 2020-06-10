import { Rational } from './rational';

/** The primary user constraint variable. */
export class Variable {
  private _name: string;
  private _value = Rational.zero;
  private _context: any = null;
  private _id: number = VarId++;

  /**
   * @param name The name to associated with the variable.
   */
  constructor(name: string = '') {
    this._name = name;
  }

  /** Returns the unique id number of the variable. */
  public id(): number {
    return this._id;
  }

  /** Returns the name of the variable. */
  public name(): string {
    return this._name;
  }

  /**
   * Set the name of the variable.
   *
   * @param name Name of the variable
   */
  public setName(name: string): void {
    this._name = name;
  }

  /** Returns the user context object of the variable. */
  public context(): any {
    return this._context;
  }

  /** Set the user context object of the variable. */
  public setContext(context: any): void {
    this._context = context;
  }

  /** Returns the value of the variable. */
  public value(): Rational {
    return this._value;
  }

  /** Set the value of the variable. */
  public setValue(value: Rational): void {
    this._value = value;
  }

  /**
   * Returns the JSON representation of the variable.
   */
  public toJSON(): any {
    return {
      name: this._name,
      value: this._value,
    };
  }

  public toString(): string {
    return this._context + '[' + this._name + ':' + this._value + ']';
  }
}

/** The internal variable id counter. */
let VarId = 0;
