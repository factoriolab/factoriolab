import { ComponentFixture } from '@angular/core/testing';

/* Don't care about coverage on test tools */
/* istanbul ignore next */
export class TestUtility {
  static getDt(
    fixture: ComponentFixture<any>,
    dt: string,
    index = 0
  ): HTMLElement {
    return this.getSelector(fixture, `[data-test="${dt}"]`, index);
  }

  static getSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0
  ): HTMLElement {
    return (fixture.nativeElement as HTMLElement).querySelectorAll(selector)[
      index
    ] as HTMLElement;
  }

  static clickDt(fixture: ComponentFixture<any>, dt: string, index = 0): void {
    return this.getDt(fixture, dt, index).click();
  }

  static clickSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0
  ): void {
    return this.getSelector(fixture, selector, index).click();
  }

  static altClickDt(
    fixture: ComponentFixture<any>,
    dt: string,
    preventDefault = false
  ): void {
    return this.altClick(this.getDt(fixture, dt), preventDefault);
  }

  static altClickSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0,
    preventDefault = false
  ): void {
    return this.altClick(
      this.getSelector(fixture, selector, index),
      preventDefault
    );
  }

  static setTextDt(
    fixture: ComponentFixture<any>,
    dt: string,
    value: string,
    index = 0
  ): void {
    return this.setText(this.getDt(fixture, dt, index), value);
  }

  static setTextSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ): void {
    return this.setText(this.getSelector(fixture, selector, index), value);
  }

  static selectDt(
    fixture: ComponentFixture<any>,
    dt: string,
    value: string,
    index = 0
  ): void {
    return this.select(this.getDt(fixture, dt, index), value);
  }

  static selectSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ): void {
    return this.select(this.getSelector(fixture, selector, index), value);
  }

  static keyPressDt(
    fixture: ComponentFixture<any>,
    dt: string,
    value: string,
    index = 0
  ): void {
    return this.keyPress(this.getDt(fixture, dt, index), value);
  }

  static keyPressSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ): void {
    return this.keyPress(this.getSelector(fixture, selector, index), value);
  }

  static dispatchDt(
    fixture: ComponentFixture<any>,
    dt: string,
    event: string,
    index = 0
  ): void {
    return this.dispatch(this.getDt(fixture, dt, index), event);
  }

  static altClick(element: HTMLElement, preventDefault = false): void {
    const event = new MouseEvent('click', { cancelable: true });
    if (preventDefault) {
      event.preventDefault();
    }
    element.dispatchEvent(event);
  }

  static dispatch(element: HTMLElement, event: string): void {
    element.dispatchEvent(new Event(event));
  }

  static setText(element: HTMLElement, value: string): void {
    (element as HTMLInputElement).value = value;
    element.dispatchEvent(new Event('input'));
  }

  static select(element: HTMLElement, value: string): void {
    (element as HTMLSelectElement).value = value;
    element.dispatchEvent(new Event('change'));
  }

  static keyPress(element: HTMLElement, value: string): void {
    element.dispatchEvent(new KeyboardEvent('keypress', { key: value }));
  }

  static mouseEvent(
    type: string,
    element: HTMLElement,
    posX: number,
    posY: number
  ): void {
    const event = new MouseEvent(type, {
      view: window,
      clientX: posX,
      clientY: posY,
    });
    element.dispatchEvent(event);
  }

  static dragAndDropSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    xOffset: number,
    yOffset: number
  ): void {
    const element = this.getSelector(fixture, selector);

    const pos = element.getBoundingClientRect();
    const centerX = Math.floor((pos.left + pos.right) / 2);
    const centerY = Math.floor((pos.top + pos.bottom) / 2);

    this.mouseEvent('mousedown', element, centerX, centerY);
    this.mouseEvent('mousemove', element, centerX + xOffset, centerY + yOffset);
    this.mouseEvent('mouseup', element, centerX + xOffset, centerY + yOffset);
  }

  static assert(condition: boolean, msg?: string): asserts condition {
    if (!condition) {
      throw new Error(msg || 'Assertion error, condition is false.');
    }
  }
}
