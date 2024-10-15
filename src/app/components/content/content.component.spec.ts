import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationService } from 'primeng/api';

import { TestModule } from '~/tests';

import { ContentComponent } from './content.component';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ContentComponent],
      providers: [ConfirmationService],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should watch for and open toast messages', () => {
      spyOn(component.messageSvc, 'add');
      component.contentSvc.showToast$.next({});
      expect(component.messageSvc.add).toHaveBeenCalled();
    });

    it('should watch for and open confirmation dialogs', () => {
      spyOn(component.confirmationSvc, 'confirm');
      component.contentSvc.showConfirm$.next({});
      expect(component.confirmationSvc.confirm).toHaveBeenCalled();
    });
  });
});
