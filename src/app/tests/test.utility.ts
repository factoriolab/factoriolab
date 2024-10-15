import { ComponentFixture } from '@angular/core/testing';

export function getSelector<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  index = 0,
): HTMLElement {
  return (fixture.nativeElement as HTMLElement).querySelectorAll(selector)[
    index
  ] as HTMLElement;
}

export function altClickSelector<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  index = 0,
  preventDefault = false,
): void {
  altClick(getSelector(fixture, selector, index), preventDefault);
}

export function altClick(element: HTMLElement, preventDefault = false): void {
  const event = new MouseEvent('click', { cancelable: true });
  if (preventDefault) {
    event.preventDefault();
  }
  element.dispatchEvent(event);
}

export function mouseEvent(
  type: string,
  element: HTMLElement,
  clientX: number,
  clientY: number,
): void {
  const event = new MouseEvent(type, {
    view: window,
    clientX,
    clientY,
  });
  element.dispatchEvent(event);
}

export function wheelEvent(
  type: string,
  element: HTMLElement,
  deltaY: number,
): void {
  const event = new WheelEvent(type, {
    view: window,
    deltaY,
  });
  element.dispatchEvent(event);
}

export function dragAndDropSelector<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  xOffset: number,
  yOffset: number,
): void {
  const element = getSelector(fixture, selector);

  const pos = element.getBoundingClientRect();
  const centerX = Math.floor((pos.left + pos.right) / 2);
  const centerY = Math.floor((pos.top + pos.bottom) / 2);

  mouseEvent('mousedown', element, centerX, centerY);
  mouseEvent('mousemove', element, centerX + xOffset, centerY + yOffset);
  mouseEvent('mouseup', element, centerX + xOffset, centerY + yOffset);
}

export function zoomSelector<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  deltaY: number,
): void {
  const element = getSelector(fixture, selector);
  wheelEvent('wheel', element, deltaY);
}

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg || 'Assertion error, condition is false.');
  }
}

export function setInputs<T>(
  fixture: ComponentFixture<T>,
  values: Partial<Record<string & keyof T, unknown>>,
): void {
  for (const key of Object.keys(values) as (keyof T & string)[])
    fixture.componentRef.setInput(key, values[key]);

  fixture.detectChanges();
}
