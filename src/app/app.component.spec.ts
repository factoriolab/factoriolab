import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';

import { TestModule } from 'src/tests';
import { AppComponent, TITLE_DSP, TITLE_SFY } from './app.component';
import { ProductsComponent, SettingsComponent } from './components';
import { APP, Game } from './models';
import { ListComponent } from './routes';
import { SharedModule } from './shared/shared.module';
import { LabState } from './store';
import * as Settings from './store/settings';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockStore: MockStore<LabState>;
  let mockGetGame: MemoizedSelector<LabState, Game>;
  let title: Title;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        SettingsComponent,
        ProductsComponent,
        ListComponent,
        AppComponent,
      ],
      imports: [TestModule, SharedModule],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        mockStore = TestBed.inject(MockStore);
        mockGetGame = mockStore.overrideSelector(
          Settings.getGame,
          Game.Factorio
        );
        component = fixture.componentInstance;
        title = TestBed.inject(Title);
      });
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update the title for Dyson Sphere Program', () => {
    mockGetGame.setResult(Game.DysonSphereProgram);
    mockStore.refreshState();
    spyOn(title, 'setTitle');
    fixture.detectChanges();
    expect(title.setTitle).toHaveBeenCalledWith(`${APP} | ${TITLE_DSP}`);
  });

  it('should update the title for Satisfactory', () => {
    mockGetGame.setResult(Game.Satisfactory);
    mockStore.refreshState();
    spyOn(title, 'setTitle');
    fixture.detectChanges();
    expect(title.setTitle).toHaveBeenCalledWith(`${APP} | ${TITLE_SFY}`);
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
