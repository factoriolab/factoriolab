import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests/test-module';

import { Dialog } from './dialog';

describe('Dialog', () => {
  let component: Dialog;
  let fixture: ComponentFixture<Dialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Dialog],
    }).compileComponents();

    fixture = TestBed.createComponent(Dialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('parseData', () => {
    it('should get the data from the componentInstance', () => {
      (component as any).dialogRef = {
        componentInstance: { header: 'header' },
      };
      component.parseData();
      expect(component['header']).toEqual('header');
    });

    it('should get the data from the dialog config', () => {
      (component as any).dialogRef = {
        config: { data: { header: 'header' } },
      };
      component.parseData();
      expect(component['header']).toEqual('header');
    });
  });

  describe('animateClose', () => {
    it('should apply the fade class and close when complete', () => {
      spyOn(component['elementRef'].nativeElement.classList, 'add');
      let handler = (): void => {};
      spyOn(
        component['elementRef'].nativeElement,
        'addEventListener',
      ).and.callFake((_: any, fn: any) => {
        handler = fn;
      });
      spyOn(component['dialogRef'], 'close');
      component.animateClose();
      handler();
      expect(
        component['elementRef'].nativeElement.classList.add,
      ).toHaveBeenCalledWith('animate-fade');
      expect(component['dialogRef'].close).toHaveBeenCalled();
    });
  });
});
