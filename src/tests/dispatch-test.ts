import { Action, ActionCreator } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

/* Don't care about coverage on test tools */
/* istanbul ignore next */
export class DispatchTest<T> {
  spy: jasmine.Spy;
  type: string | undefined;

  constructor(
    public mockStore: MockStore,
    public component: T,
  ) {
    this.spy = spyOn(this.mockStore, 'dispatch').and.callFake(
      (a) => (this.type = a.type),
    );
  }

  void(key: keyof T, action: ActionCreator<any, () => Action>): void {
    (this.component[key] as unknown as () => void)();
    expect(this.type).toEqual(action().type);
  }

  props(
    key: keyof T,
    action: ActionCreator<any, (props: any) => Action>,
    params: any[] = [],
  ): void {
    (this.component[key] as unknown as (...args: any[]) => void)(...params);
    expect(this.type).toEqual(action({}).type);
  }
}
