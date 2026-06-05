import { ResourceRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import localforage from 'localforage';

import {
  localForageResource,
  storeLocalForageValue,
} from './local-forage-resource';

describe('storeLocalForageValue', () => {
  it('should remove or set the value in localforage', async () => {
    spyOn(localforage, 'removeItem').and.returnValue(Promise.resolve());
    await storeLocalForageValue('data', null);
    expect(localforage.removeItem).toHaveBeenCalled();
    spyOn(localforage, 'setItem').and.returnValue(Promise.resolve());
    await storeLocalForageValue('data', 'data');
    expect(localforage.setItem).toHaveBeenCalled();
  });
});

describe('localForageResource', () => {
  it('should store the value when set', () => {
    let resource: ResourceRef<unknown>;
    TestBed.runInInjectionContext(() => {
      resource = localForageResource('data');
    });
    spyOn(localforage, 'removeItem').and.returnValue(Promise.resolve());
    resource!.set(null);
    TestBed.tick();
    expect(localforage.removeItem).toHaveBeenCalled();
  });
});
