import { Type } from '@angular/core';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

/* Don't care about coverage on test tools */
/* istanbul ignore next */
export class DispatchTest<T> {
  spy = spyOn(this.mockStore, 'dispatch');

  constructor(public mockStore: MockStore, public component: T) {}

  void(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as () => void)();
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(new action());
  }

  val(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string) => void)('value');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(new action('value'));
  }

  valDef(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string, def: string) => void)(
      'value',
      'def'
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ value: 'value', def: 'def' })
    );
  }

  valPrev(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string, prev: string) => void)(
      'value',
      'prev'
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ value: 'value', prev: 'prev' })
    );
  }

  idVal(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (id: string, value: string) => void)(
      'id',
      'value'
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value' })
    );
  }

  idValDef(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        value: string,
        def: string
      ) => void
    )('id', 'value', 'def');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value', def: 'def' })
    );
  }
}
