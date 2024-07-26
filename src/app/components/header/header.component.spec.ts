import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { Mocks, TestModule } from 'src/tests';
import { Objectives } from '~/store';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockStore: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should update the page title with the first objective name', () => {
      spyOn(component.title, 'setTitle');
      mockStore.overrideSelector(
        Objectives.getBaseObjectives,
        Mocks.ObjectivesList,
      );
      mockStore.refreshState();
      expect(component.title.setTitle).toHaveBeenCalledWith(
        'Advanced circuit | FactorioLab',
      );
    });
  });

  describe('cancelRouterLink', () => {
    it('should prevent the dropdown from being treated as an anchor', () => {
      const event = {
        preventDefault: (): void => {},
        stopPropagation: (): void => {},
      };
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      component.cancelRouterLink(event as any);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });
});
