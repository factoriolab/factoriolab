import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { Items, LabState, Machines } from '~/store';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.idVal('setItemExcluded', Items.SetExcludedAction);
    dispatch.idVal('setItemChecked', Items.SetCheckedAction);
    dispatch.val('resetItem', Items.ResetItemAction);
    dispatch.val('resetMachine', Machines.ResetMachineAction);
  });
});
