import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';

import { TestModule } from 'src/tests';
import { ContentService } from '~/services';
import { ContentComponent } from './content.component';

describe('ConnectedOverlayScrollHandler', () => {
  it('should include the window in the list of scrollable parents', () => {
    spyOn(DomHandler, 'getScrollableParents').and.returnValue([]);
    const scrollHandler = new ConnectedOverlayScrollHandler({} as any);
    scrollHandler.bindScrollListener();
    expect(scrollHandler.scrollableParents).toEqual([window]);
  });
});

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;
  let contentSvc: ContentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentComponent],
      imports: [TestModule],
      providers: [ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentComponent);
    contentSvc = TestBed.inject(ContentService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should watch for and open confirmation dialogs', () => {
      spyOn(component['confirmationSvc'], 'confirm');
      contentSvc.showConfirm$.next({});
      expect(component['confirmationSvc'].confirm).toHaveBeenCalled();
    });
  });
});
