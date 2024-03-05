import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';

import { TestModule } from 'src/tests';
import { ContentService } from '~/services';
import { ContentComponent } from './content.component';

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
    it('should watch for and open toast messages', () => {
      spyOn(component['messageSvc'], 'add');
      contentSvc.showToast$.next({});
      expect(component['messageSvc'].add).toHaveBeenCalled();
    });

    it('should watch for and open confirmation dialogs', () => {
      spyOn(component['confirmationSvc'], 'confirm');
      contentSvc.showConfirm$.next({});
      expect(component['confirmationSvc'].confirm).toHaveBeenCalled();
    });
  });
});
