import { HttpTestingController } from '@angular/common/http/testing';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SwUpdate,
  UnrecoverableStateEvent,
  VersionEvent,
} from '@angular/service-worker';
import { of, Subject } from 'rxjs';

import { CustomDataDialog } from '~/components/custom-data-dialog/custom-data-dialog';
import { CUSTOM_MOD } from '~/data/game';
import { TestModule } from '~/tests/test-module';

import { App } from './app';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let http: HttpTestingController;
  const swUpdate = {
    unrecoverable: new Subject<UnrecoverableStateEvent>(),
    versionUpdates: new Subject<VersionEvent>(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SwUpdate, useValue: swUpdate },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    http = TestBed.inject(HttpTestingController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should log the version info', async () => {
      vi.spyOn<any, any>(component, 'log');
      http.expectOne('release.json').flush({ version: 'version' });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['log']).toHaveBeenCalled();
    });

    it('should handle unrecoverable updates', () => {
      vi.spyOn(component['confirm'], 'open');
      swUpdate.unrecoverable.next({} as any);
      expect(component['confirm'].open).toHaveBeenCalled();
    });

    it('should handle version updates', () => {
      vi.spyOn(component['windowClient'], 'reload');
      vi.spyOn(component['confirm'], 'open').mockReturnValue(of(true));
      swUpdate.versionUpdates.next({ type: 'VERSION_READY' } as any);
      expect(component['confirm'].open).toHaveBeenCalled();
      expect(component['windowClient'].reload).toHaveBeenCalled();
    });

    it('should open the custom data dialog if selected', () => {
      vi.spyOn(component['dialog'], 'open');
      component['settingsStore'].apply({ modId: CUSTOM_MOD });
      TestBed.tick();
      expect(component['dialog'].open).toHaveBeenCalledWith(CustomDataDialog);
    });
  });
});
