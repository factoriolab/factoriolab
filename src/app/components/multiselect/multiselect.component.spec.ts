import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility } from 'src/tests';
import { IconComponent } from '../icon/icon.component';
import { MultiselectComponent } from './multiselect.component';

@Component({
  selector: 'lab-test-multiselect',
  template: `
    <lab-multiselect
      [enabledIds]="enabledIds"
      [options]="options"
      (cancel)="cancel()"
      (enableMod)="enableMod($event)"
      (disableMod)="disableMod($event)"
    >
    </lab-multiselect>
  `,
})
class TestMultiselectComponent {
  @ViewChild(MultiselectComponent) child: MultiselectComponent;
  enabledIds = [];
  options = Mocks.DataState.modIds.map((i) => Mocks.DataState.modEntities[i]);
  cancel() {}
  enableMod(data) {}
  disableMod(data) {}
}

describe('MultiselectComponent', () => {
  let component: TestMultiselectComponent;
  let fixture: ComponentFixture<TestMultiselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        MultiselectComponent,
        TestMultiselectComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMultiselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set opening to false on first click event', () => {
    spyOn(component, 'cancel');
    document.body.click();
    expect(component.cancel).not.toHaveBeenCalled();
    expect(component.child.opening).toEqual(false);
  });

  it('should cancel when clicked away', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    document.body.click();
    expect(component.cancel).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.header');
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should enable a mod', () => {
    spyOn(component, 'enableMod');
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.clickable', 0);
    expect(component.enableMod).toHaveBeenCalledWith(Mocks.DataState.modIds[0]);
    expect(component.cancel).not.toHaveBeenCalled();
  });

  it('should disable a mod', () => {
    component.enabledIds = [Mocks.DataState.modIds[0]];
    fixture.detectChanges();
    spyOn(component, 'disableMod');
    spyOn(component, 'cancel');
    component.child.opening = false;
    TestUtility.clickSelector(fixture, '.clickable', 0);
    expect(component.disableMod).toHaveBeenCalledWith(
      Mocks.DataState.modIds[0]
    );
    expect(component.cancel).not.toHaveBeenCalled();
  });
});
