import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from '~/tests';

import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, HeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should update the page title with the first objective name', () => {
      spyOn(component.title, 'setTitle');

      component.objectivesSvc.load(Mocks.objectivesState);
      fixture.detectChanges();
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
