import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';

import { reducers, metaReducers, State } from '~/store';
import * as Settings from '~/store/settings';
import { TestUtility } from '~/utilities/test';
import { IconComponent } from '../icon/icon.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsContainerComponent } from './settings-container.component';

describe('SettingsContainerComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let store: Store<State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, StoreModule.forRoot(reducers, { metaReducers })],
      declarations: [
        IconComponent,
        SettingsComponent,
        SettingsContainerComponent,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SettingsContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        store = TestBed.inject(Store);
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cancel when clicked away', () => {
    spyOn(component.cancel, 'emit');
    document.body.click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should not cancel when clicked on', () => {
    spyOn(component.cancel, 'emit');
    TestUtility.clickSelector(fixture, 'lab-settings');
    expect(component.cancel.emit).not.toHaveBeenCalled();
  });

  it('should set item precision', () => {
    spyOn(store, 'dispatch');
    component.child.setItemPrecision.emit(0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetItemPrecisionAction(0)
    );
  });

  it('should set belt precision', () => {
    spyOn(store, 'dispatch');
    component.child.setBeltPrecision.emit(0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetBeltPrecisionAction(0)
    );
  });

  it('should set factory precision', () => {
    spyOn(store, 'dispatch');
    component.child.setFactoryPrecision.emit(0);
    expect(store.dispatch).toHaveBeenCalledWith(
      new Settings.SetFactoryPrecisionAction(0)
    );
  });
});
