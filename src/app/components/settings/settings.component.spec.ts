import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { TestUtility, ItemId, initialState } from 'src/tests';
import {
  ColumnsComponent,
  IconComponent,
  InfoComponent,
  InputComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from '~/components';
import { ValidateNumberDirective } from '~/directives';
import { Game } from '~/models';
import { RouterService } from '~/services';
import * as Preferences from '~/store/preferences';
import { BrowserUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

enum DataTest {
  FlowRate = 'lab-settings-flow-rate',
  MiningBonus = 'lab-settings-mining-bonus',
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let router: Router;
  let detectChanges: jasmine.Spy;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      declarations: [
        ColumnsComponent,
        IconComponent,
        InfoComponent,
        InputComponent,
        OptionsComponent,
        RankerComponent,
        SelectComponent,
        ToggleComponent,
        ValidateNumberDirective,
        SettingsComponent,
      ],
      providers: [RouterService, provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    fixture.detectChanges();
    // window.history.replaceState(null, '', '');
  });

  // afterEach(() => {
  //   window.history.replaceState(null, '', '');
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('ngOnInit', () => {
  //   it('should ignore if no matching state is found', () => {
  //     expect(component.child.state).toEqual('');
  //   });

  //   it('should set state to matching saved state', () => {
  //     spyOnProperty(BrowserUtility, 'search').and.returnValue('z=zip');
  //     component.child.ngOnInit();
  //     expect(component.child.state).toEqual('name');
  //   });

  //   it('should set up subscription to router', () => {
  //     fixture.ngZone.run(() => {
  //       router.navigate([]);
  //     });
  //     fixture.detectChanges();
  //     expect(detectChanges).toHaveBeenCalled();
  //   });
  // });

  // describe('scroll', () => {
  //   it('should detect changes on scroll', () => {
  //     component.child.scroll();
  //     expect(detectChanges).toHaveBeenCalled();
  //   });
  // });

  // describe('setGame', () => {
  //   it('should select the baseId for Factorio', () => {
  //     spyOn(component, 'setBase');
  //     component.child.setGame(Game.Factorio);
  //     expect(component.setBase).toHaveBeenCalledWith('1.1');
  //   });

  //   it('should select the baseId for Dyson Sphere Program', () => {
  //     spyOn(component, 'setBase');
  //     component.child.setGame(Game.DysonSphereProgram);
  //     expect(component.setBase).toHaveBeenCalledWith('dsp');
  //   });

  //   it('should select the baseId for Satisfactory', () => {
  //     spyOn(component, 'setBase');
  //     component.child.setGame(Game.Satisfactory);
  //     expect(component.setBase).toHaveBeenCalledWith('sfy');
  //   });
  // });

  // describe('changeBeaconCount', () => {
  //   it('should emit beacon count', () => {
  //     spyOn(component, 'setBeaconCount');
  //     component.child.changeBeaconCount('', '3');
  //     expect(component.setBeaconCount).toHaveBeenCalledWith({
  //       id: '',
  //       value: '3',
  //       def: '8',
  //     });
  //   });

  //   it('should emit beacon count on specific factory', () => {
  //     spyOn(component, 'setBeaconCount');
  //     component.child.changeBeaconCount(ItemId.AssemblingMachine3, '3');
  //     expect(component.setBeaconCount).toHaveBeenCalledWith({
  //       id: ItemId.AssemblingMachine3,
  //       value: '3',
  //       def: '8',
  //     });
  //   });
  // });

  // describe('changeOverclock', () => {
  //   it('should emit overclock', () => {
  //     spyOn(component, 'setOverclock');
  //     component.child.changeOverclock('', {
  //       target: { valueAsNumber: 200 },
  //     } as any);
  //     expect(component.setOverclock).toHaveBeenCalledWith({
  //       id: '',
  //       value: 200,
  //       def: 100,
  //     });
  //   });

  //   it('should emit overclock on specific factory', () => {
  //     spyOn(component, 'setOverclock');
  //     component.child.changeOverclock(ItemId.AssemblingMachine3, {
  //       target: { valueAsNumber: 200 },
  //     } as any);
  //     expect(component.setOverclock).toHaveBeenCalledWith({
  //       id: ItemId.AssemblingMachine3,
  //       value: 200,
  //       def: null,
  //     });
  //   });

  //   it('should ignore bad values', () => {
  //     spyOn(component, 'setOverclock');
  //     component.child.changeOverclock('', {
  //       target: { valueAsNumber: 260 },
  //     } as any);
  //     expect(component.setOverclock).not.toHaveBeenCalled();
  //   });
  // });

  // describe('emitNumber', () => {
  //   it('should emit flow rate', () => {
  //     spyOn(component, 'setFlowRate');
  //     TestUtility.setTextDt(fixture, DataTest.FlowRate, '1000');
  //     fixture.detectChanges();
  //     expect(component.setFlowRate).toHaveBeenCalledWith(1000);
  //   });

  //   it('should emit mining bonus', () => {
  //     spyOn(component, 'setMiningBonus');
  //     TestUtility.setTextDt(fixture, DataTest.MiningBonus, '100');
  //     fixture.detectChanges();
  //     expect(component.setMiningBonus).toHaveBeenCalledWith(100);
  //   });

  //   it('should not emit a number less than the minimum', () => {
  //     spyOn(component, 'setMiningBonus');
  //     TestUtility.setTextDt(fixture, DataTest.MiningBonus, '-10');
  //     fixture.detectChanges();
  //     expect(component.setMiningBonus).toHaveBeenCalledWith(0);
  //   });
  // });

  // describe('setState', () => {
  //   it('should ignore falsy values', () => {
  //     spyOn(router, 'navigate');
  //     component.child.setState(null);
  //     expect(router.navigate).not.toHaveBeenCalled();
  //   });

  //   it('should call the router to navigate', () => {
  //     spyOn(router, 'navigate');
  //     component.child.setState('name');
  //     expect(component.child.state).toEqual('name');
  //     expect(router.navigate).toHaveBeenCalledWith([], {
  //       queryParams: { z: 'zip' },
  //     });
  //   });
  // });

  // describe('clickSaveState', () => {
  //   it('should emit to save the state', () => {
  //     spyOn(component, 'saveState');
  //     component.child.tempState = id;
  //     component.child.editState = true;
  //     spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
  //     component.child.clickSaveState();
  //     expect(component.saveState).toHaveBeenCalledWith({ id, value });
  //     expect(component.child.editState).toBeFalse();
  //   });
  // });

  // describe('clickRemoveState', () => {
  //   it('should emit to remove the state', () => {
  //     spyOn(component, 'removeState');
  //     component.child.state = id;
  //     component.child.state = id;
  //     component.child.clickRemoveState();
  //     expect(component.removeState).toHaveBeenCalledWith(id);
  //     expect(component.child.state).toEqual('');
  //   });
  // });

  // describe('toggleEditState', () => {
  //   it('should toggle the edit state', () => {
  //     component.child.toggleEditState();
  //     expect(component.child.editState).toBeTrue();
  //     expect(component.child.tempState).toEqual(component.child.state);
  //   });
  // });

  // describe('clickResetSettings', () => {
  //   it('should cancel if user does not confirm', () => {
  //     spyOn(component, 'resetSettings');
  //     spyOn(window, 'confirm').and.returnValue(false);
  //     component.child.clickResetSettings();
  //     expect(window.confirm).toHaveBeenCalled();
  //     expect(component.resetSettings).not.toHaveBeenCalled();
  //   });

  //   it('should emit to reset settings if user confirms', () => {
  //     spyOn(component, 'resetSettings');
  //     spyOn(window, 'confirm').and.returnValue(true);
  //     component.child.clickResetSettings();
  //     expect(window.confirm).toHaveBeenCalled();
  //     expect(component.resetSettings).toHaveBeenCalled();
  //   });
  // });

  // describe('gtZero', () => {
  //   it('should handle valid values', () => {
  //     expect(component.child.gtZero('0')).toBeFalse();
  //     expect(component.child.gtZero('0.5')).toBeTrue();
  //   });

  //   it('should handle invalid value', () => {
  //     expect(component.child.gtZero('x')).toBeFalse();
  //   });
  // });

  // describe('toggleBeaconPower', () => {
  //   it('should turn off beacon power estimation', () => {
  //     component.child.settings = {
  //       ...component.child.settings,
  //       ...{ beaconReceivers: '1' },
  //     };
  //     spyOn(component, 'setBeaconReceivers');
  //     component.child.toggleBeaconPower();
  //     expect(component.setBeaconReceivers).toHaveBeenCalledWith(null);
  //   });

  //   it('should turn on beacon power estimation', () => {
  //     spyOn(component, 'setBeaconReceivers');
  //     component.child.toggleBeaconPower();
  //     expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
  //   });
  // });
});
