import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, TestModule } from 'src/tests';
import { AppSharedModule } from '~/app-shared.module';
import { LabState, Settings } from '~/store';
import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObjectivesComponent],
      imports: [AppSharedModule, TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectivesComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should dispatch actions', () => {
  //   const dispatch = new DispatchTest(mockStore, component);
  //   dispatch.val('removeProduct', Products.RemoveAction);
  //   dispatch.idVal('setItem', Products.SetItemAction);
  //   dispatch.idVal('setRate', Products.SetRateAction);
  //   dispatch.idVal('setRateType', Products.SetRateTypeAction);
  //   dispatch.val('removeProducer', Producers.RemoveAction);
  //   dispatch.idVal('setRecipe', Producers.SetRecipeAction);
  //   dispatch.idVal('setCount', Producers.SetCountAction);
  //   dispatch.val('addProduct', Products.AddAction);
  //   dispatch.val('addProducer', Producers.AddAction);
  //   dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
  // });
});
