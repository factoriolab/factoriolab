import { Type } from '@angular/core';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

/* Don't care about coverage on test tools */
/* istanbul ignore next */
export class DispatchTest<T> {
  constructor(public mockStore: MockStore, public component: T) {
    spyOn(mockStore, 'dispatch');
  }

  void(key: keyof T, action: Type<Action>): void {
    (this.component[key] as unknown as () => void)();
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(new action());
  }

  val(key: keyof T, action: Type<Action>): void {
    (this.component[key] as unknown as (value: string) => void)('value');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(new action('value'));
  }

  valDefArr(key: keyof T, action: Type<Action>): void {
    (
      this.component[key] as unknown as (value: [string], def: [string]) => void
    )(['value'], ['def']);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ value: ['value'], def: ['def'] })
    );
  }

  idVal(key: keyof T, action: Type<Action>): void {
    (this.component[key] as unknown as (id: string, value: string) => void)(
      'id',
      'value'
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value' })
    );
  }

  idValDef(key: keyof T, action: Type<Action>): void {
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

  idValDefNum(key: keyof T, action: Type<Action>): void {
    (
      this.component[key] as unknown as (
        id: string,
        value: number,
        def: number
      ) => void
    )('id', 0, 1);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 0, def: 1 })
    );
  }

  idValDefArr(key: keyof T, action: Type<Action>): void {
    (
      this.component[key] as unknown as (
        id: string,
        value: [string],
        def: [string]
      ) => void
    )('id', ['value'], ['def']);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: ['value'], def: ['def'] })
    );
  }
}
