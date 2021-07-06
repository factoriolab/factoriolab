import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';

import { OptionsComponent, ColumnsComponent } from '~/components';
import { LinkValue } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import { SetLinkSizeAction, SetLinkTextAction } from '~/store/preferences';
import { ListComponent, ListContainerComponent } from '../list-container';
import { SankeyComponent } from './sankey/sankey.component';
import { FlowContainerComponent } from './flow-container.component';

describe('FlowContainerComponent', () => {
  let component: FlowContainerComponent;
  let fixture: ComponentFixture<FlowContainerComponent>;
  let store: Store<State>;
  let detectChanges: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ColumnsComponent,
        OptionsComponent,
        SankeyComponent,
        ListComponent,
        ListContainerComponent,
        FlowContainerComponent,
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.inject(Store);
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    detectChanges = spyOn(ref.constructor.prototype, 'detectChanges');
    spyOn(store, 'dispatch');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the selected node', () => {
    component.setSelected('node');
    expect(component.selected).toEqual('node');
    expect(detectChanges).toHaveBeenCalled();
  });

  it('should set the link size', () => {
    component.setLinkSize(LinkValue.Belts);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetLinkSizeAction(LinkValue.Belts)
    );
  });

  it('should set the link text', () => {
    component.setLinkText(LinkValue.Belts);
    expect(store.dispatch).toHaveBeenCalledWith(
      new SetLinkTextAction(LinkValue.Belts)
    );
  });
});
