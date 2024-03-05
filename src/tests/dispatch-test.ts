import { Type } from '@angular/core';
import { Action } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

/* Don't care about coverage on test tools */
/* istanbul ignore next */
export class DispatchTest<T> {
  spy = spyOn(this.mockStore, 'dispatch');

  constructor(
    public mockStore: MockStore,
    public component: T,
  ) {}

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

  valAlt(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string, alt: boolean) => void)(
      'value',
      true,
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(new action('value'));
  }

  valDef(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string, def: string) => void)(
      'value',
      'def',
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ value: 'value', def: 'def' }),
    );
  }

  valPrev(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (value: string, prev: string) => void)(
      'value',
      'prev',
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ value: 'value', prev: 'prev' }),
    );
  }

  idVal(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (id: string, value: string) => void)(
      'id',
      'value',
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value' }),
    );
  }

  idValAlt(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        value: string,
        alt: boolean,
      ) => void
    )('id', 'value', true);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value' }),
    );
  }

  idValDef(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        value: string,
        def: string,
      ) => void
    )('id', 'value', 'def');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value', def: 'def' }),
    );
  }

  idValDefAlt(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        value: string,
        def: string,
        alt: boolean,
      ) => void
    )('id', 'value', 'def', true);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', value: 'value', def: 'def' }),
    );
  }

  idIndVal(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        index: number,
        value: string,
      ) => void
    )('id', 0, 'value');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', index: 0, value: 'value' }),
    );
  }

  idIndValAlt(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        index: number,
        value: string,
        alt: boolean,
      ) => void
    )('id', 0, 'value', true);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', index: 0, value: 'value' }),
    );
  }

  idIndValDef(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        index: number,
        value: string,
        def: string,
      ) => void
    )('id', 0, 'value', 'def');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', index: 0, value: 'value', def: 'def' }),
    );
  }

  idIndValDefAlt(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        id: string,
        index: number,
        value: string,
        def: string,
        alt: boolean,
      ) => void
    )('id', 0, 'value', 'def', true);
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ id: 'id', index: 0, value: 'value', def: 'def' }),
    );
  }

  keyId(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (this.component[key] as unknown as (key: string, id: string) => void)(
      'key',
      'id',
    );
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ key: 'key', id: 'id' }),
    );
  }

  keyIdVal(key: keyof T, action: Type<Action>): void {
    this.spy.calls.reset();
    (
      this.component[key] as unknown as (
        key: string,
        id: string,
        value: string,
      ) => void
    )('key', 'id', 'value');
    expect(this.mockStore.dispatch).toHaveBeenCalledWith(
      new action({ key: 'key', id: 'id', value: 'value' }),
    );
  }
}
