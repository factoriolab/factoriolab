import { ComponentFixture } from '@angular/core/testing';

import { ElementId } from './element-id';

/* Don't care about coverage on test utility. */
/* istanbul ignore next */
export class TestUtility {
  static getId(fixture: ComponentFixture<any>, id: ElementId) {
    return this.getSelector(fixture, `#${id}`);
  }

  static getSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0
  ) {
    return fixture.nativeElement.querySelectorAll(selector)[index];
  }

  static clickId(fixture: ComponentFixture<any>, id: ElementId) {
    return this.getId(fixture, id).click();
  }

  static clickSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0
  ) {
    return this.getSelector(fixture, selector, index).click();
  }

  static altClickId(fixture: ComponentFixture<any>, id: ElementId) {
    return this.altClick(this.getId(fixture, id));
  }

  static altClickSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    index = 0
  ) {
    return this.altClick(this.getSelector(fixture, selector, index));
  }

  static setTextId(
    fixture: ComponentFixture<any>,
    id: ElementId,
    value: string
  ) {
    return this.setText(this.getId(fixture, id), value);
  }

  static setTextSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ) {
    return this.setText(this.getSelector(fixture, selector, index), value);
  }

  static selectId(
    fixture: ComponentFixture<any>,
    id: ElementId,
    value: string
  ) {
    return this.select(this.getId(fixture, id), value);
  }

  static selectSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ) {
    return this.select(this.getSelector(fixture, selector, index), value);
  }

  static keyPressId(
    fixture: ComponentFixture<any>,
    id: ElementId,
    value: string
  ) {
    return this.keyPress(this.getId(fixture, id), value);
  }

  static keyPressSelector(
    fixture: ComponentFixture<any>,
    selector: string,
    value: string,
    index = 0
  ) {
    return this.keyPress(this.getSelector(fixture, selector, index), value);
  }

  static dispatchId(
    fixture: ComponentFixture<any>,
    id: ElementId,
    event: string
  ) {
    return this.dispatch(this.getId(fixture, id), event);
  }

  static altClick(object: any) {
    object.dispatchEvent(new MouseEvent('click'));
  }

  static dispatch(object: any, event: string) {
    object.dispatchEvent(new Event(event));
  }

  static setText(object: any, value: string) {
    object.value = value;
    object.dispatchEvent(new Event('input'));
  }

  static select(object: any, value: string) {
    object.value = value;
    object.dispatchEvent(new Event('change'));
  }

  static keyPress(object: any, value: string) {
    const event: any = document.createEvent('CustomEvent');
    event.key = value;
    event.initEvent('keypress', true, true);
    object.dispatchEvent(event);
  }
}
