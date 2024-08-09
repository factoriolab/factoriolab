import { NoDragDirective } from './no-drag.directive';

describe('NoDragDirective', () => {
  it('should cancel drag events', () => {
    const event = { stopPropagation: (): void => {} };
    const spy = spyOn(event, 'stopPropagation');
    const noDrag = new NoDragDirective();
    noDrag.onMousedown(event as any);
    expect(event.stopPropagation).toHaveBeenCalled();
    spy.calls.reset();
    noDrag.onTouchStart(event as any);
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
