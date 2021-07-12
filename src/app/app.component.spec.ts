import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { RouterService } from './services';
import { State, reducers, metaReducers } from './store';
import {
  IconComponent,
  SettingsContainerComponent,
  SettingsComponent,
  ProductsContainerComponent,
  ProductsComponent,
  ListContainerComponent,
  ListComponent,
  OptionsComponent,
  PickerComponent,
} from './components';
import { AppComponent } from './app.component';
import { APP, TITLE_DSP } from './models';
import { SetBaseAction } from './store/settings';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: Store<State>;
  let router: RouterService;
  let title: Title;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        OptionsComponent,
        PickerComponent,
        SettingsContainerComponent,
        SettingsComponent,
        ProductsContainerComponent,
        ProductsComponent,
        ListContainerComponent,
        ListComponent,
        AppComponent,
      ],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        router = TestBed.inject(RouterService);
        title = TestBed.inject(Title);
      });
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update the title', () => {
    store.dispatch(new SetBaseAction('dsp'));
    spyOn(title, 'setTitle');
    fixture.detectChanges();
    expect(title.setTitle).toHaveBeenCalledWith(`${APP} | ${TITLE_DSP}`);
  });

  it('should hide the poll if persisted', () => {
    spyOnProperty(component, 'lsHidePoll').and.returnValue(true);
    component.showPoll = true;
    fixture.detectChanges();
    expect(component.showPoll).toBeFalse();
  });

  describe('hidePoll', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('should hide the poll', () => {
      component.showPoll = true;
      component.hidePoll();
      expect(component.showPoll).toBeFalse();
    });

    it('should set the localStorage key', () => {
      component.hidePoll(true);
      expect(component.lsHidePoll).toBeTrue();
    });
  });
});
