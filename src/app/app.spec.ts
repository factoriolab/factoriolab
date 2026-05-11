import { HttpTestingController } from '@angular/common/http/testing';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SwUpdate,
  UnrecoverableStateEvent,
  VersionEvent,
} from '@angular/service-worker';
import { of, Subject } from 'rxjs';

import { TestModule } from '~/tests';

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
      vi.spyOn(console, 'log');
      vi.spyOn(component['analytics'], 'event');
      http.expectOne('release.json').flush({ version: 'version' });
      await TestBed.inject(ApplicationRef).whenStable();
      expect(component['analytics'].event).toHaveBeenCalled();
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
  });
});
