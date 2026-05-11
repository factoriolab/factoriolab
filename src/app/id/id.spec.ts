import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from '~/tests';

import { Id } from './id';

describe('Id', () => {
  let component: Id;
  let fixture: ComponentFixture<Id>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Id],
    }).compileComponents();

    fixture = TestBed.createComponent(Id);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setup', () => {
    it('should apply the mod id from the route', () => {
      vi.spyOn(component['route'].snapshot.paramMap, 'get').mockReturnValue(
        'modId',
      );
      vi.spyOn(component['settingsStore'], 'apply');
      component['setup']();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        modId: 'modId',
      });
    });
  });
});
