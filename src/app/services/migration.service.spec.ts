import { TestBed } from '@angular/core/testing';

import { ZEMPTY } from '~/models/constants';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { MigrationService } from './migration.service';
import { RouterService } from './router.service';

describe('MigrationService', () => {
  let service: MigrationService;
  let routerSvc: RouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(MigrationService);
    routerSvc = TestBed.inject(RouterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('migrate', () => {
    it('should return empty params without alteration', () => {
      const originalParams = {};
      const { params } = service.migrate(undefined, originalParams);
      expect(params).toEqual(originalParams);
    });

    it('should return latest version without alteration', () => {
      const originalParams = { v: routerSvc.version };
      const { params } = service.migrate(undefined, originalParams);
      expect(params).toEqual(originalParams);
    });

    it('should decode v0 parameters', () => {
      const originalParams = { p: '%3D', z: 'z' };
      const { params } = service.migrate(undefined, originalParams);
      expect(params).toEqual({ o: [ZEMPTY], v: routerSvc.version, z: 'z' });
    });

    it('should decode array parameters', () => {
      const originalParams = { a: ['%3D'] };
      const { params } = service.migrate(undefined, originalParams);
      expect(params).toEqual({ a: [ZEMPTY], v: routerSvc.version } as any);
    });

    it('should coerce expected keys into arrays', () => {
      const originalParams = { o: ItemId.Coal, v: routerSvc.version };
      const { params } = service.migrate(undefined, originalParams);
      expect(params).toEqual({ o: [ItemId.Coal], v: routerSvc.version });
    });
  });

  describe('migrateV0', () => {
    it('should handle unrecognized/null baseid', () => {
      const state = service.migrateV0({
        params: { s: '---' },
        warnings: [],
        isBare: true,
      });
      expect(state.modId).toBeUndefined();
    });

    it('should handle preset without other settings', () => {
      const { params } = service.migrateV0({
        params: { b: '0' },
        warnings: [],
        isBare: true,
      });
      expect(params['mpr']).toEqual('0');
    });

    it('should parse old display rate', () => {
      const { params } = service.migrateV0({
        params: { s: '******1' },
        warnings: [],
        isBare: true,
      });
      expect(params['odr']).toEqual('0');
    });
  });

  describe('migrateV2', () => {
    it('should handle undefined beaconCount', () => {
      const { params } = service.migrateV2({
        params: { r: '***?', f: '**?' },
        warnings: [],
        isBare: false,
      });
      expect(params['r']).toBeUndefined();
      expect(params['m']).toBeUndefined();
    });
  });

  describe('migrateV6', () => {
    it('should convert item objectives by machines into recipe objectives and into unified objective', () => {
      const { params } = service.migrateV6({
        params: { p: 'coal*1*3' },
        warnings: [],
        isBare: true,
      });
      expect(params['o']).toEqual(['coal*1*3']);
    });

    it('should convert item objective by machines with limit step into maximize / limit recipe objectives and into unified objective', () => {
      const { params } = service.migrateV6({
        params: { p: 'iron-plate*1*3*iron-ore', q: 'coal*1' },
        warnings: [],
        isBare: true,
      });
      expect(params['o']).toEqual([
        'coal*1*3',
        'iron-plate*1*3*2',
        'iron-ore*1*3*3',
      ]);
      expect(params['q']).toBeUndefined();
    });

    it('should convert item objective with limit step into maximize / limit item objectives', () => {
      const { params } = service.migrateV6({
        params: { p: 'iron-plate*1**iron-ore' },
        warnings: [],
        isBare: true,
      });
      expect(params['o']).toEqual(['iron-plate*1**2', 'iron-ore*1**3']);
    });

    it('should remove item default recipe', () => {
      const { params } = service.migrateV6({
        params: { i: 'coal*1*transport-belt*cargo-wagon*coal' },
        warnings: [],
        isBare: true,
      });
      expect(params['i']).toEqual(['coal*transport-belt*cargo-wagon']);
    });

    it('should convert disabled recipes into excluded recipes', () => {
      const { params } = service.migrateV6({
        params: { s: '***coal' },
        warnings: [],
        isBare: true,
      });
      expect(params['v10rex']).toEqual('coal');
    });

    it('should convert disabled recipes into excluded recipes on existing recipe settings', () => {
      const { params } = service.migrateV6({
        params: { s: '***coal', r: 'coal*electric-mining-drill' },
        warnings: [],
        isBare: true,
      });
      expect(params['v10rex']).toEqual('coal');
    });
  });

  describe('migrateV7', () => {
    it('should convert hashed objectives by machines to use items', () => {
      const { params } = service.migrateV7({
        params: { p: 'Dc*1*3', s: '0**=*A**Po**A*0', v: '7' },
        warnings: [],
        isBare: false,
      });
      expect(params['o']).toEqual(['Dc*1*0']);
    });
  });

  describe('migrateV8', () => {
    it('should convert recipe objectives to unified objectives', () => {
      const { params } = service.migrateV8({
        params: { p: 'steel-chest*1*1', q: 'steel-chest*1' },
        warnings: [],
        isBare: true,
      });
      expect(params['o']).toEqual(['steel-chest*1*1', 'steel-chest*1*3']);
    });
  });

  describe('migrateV9', () => {
    it('should handle migrating machine modules', () => {
      const { params } = service.migrateV9({
        params: { f: '1_A*speed-module' },
        warnings: [],
        isBare: true,
      });
      expect(params['mmr']).toEqual('A');
      expect(params['m']).toEqual(['A*0']);
      expect(params['e']).toEqual(['*speed-module']);
    });

    it('should handle migrating fuel rank', () => {
      const { params } = service.migrateV9({
        params: { f: 'A', s: '*****coal' },
        warnings: [],
        isBare: true,
      });
      expect(params['m']).toBeUndefined();
      expect(params['mfr']).toEqual('coal');
    });
  });

  describe('restoreV10ResearchedTechnologies', () => {
    it('should return undefined if no technologies are found', () => {
      const result = service.restoreV10ResearchedTechnologies(
        new Set([RecipeId.ArtilleryShellRange]),
        { items: [] } as any,
      );
      expect(result).toBeUndefined();
    });

    it('should restore the old filtered style list of technologies', () => {
      const result = service.restoreV10ResearchedTechnologies(
        new Set([RecipeId.ArtilleryShellRange]),
        Mocks.modData,
      );
      expect(result?.size).toEqual(54);
    });

    it('should return undefined if all researched', () => {
      const result = service.restoreV10ResearchedTechnologies(
        new Set(Mocks.dataset.technologyIds),
        Mocks.modData,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('parseNNumber', () => {
    it('should parse undefined', () => {
      expect(service.parseNNumber(undefined)).toBeUndefined();
      expect(service.parseNNumber('')).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNNumber('A')).toEqual(0);
    });
  });

  describe('parseSet', () => {
    it('should parse undefined', () => {
      expect(service.parseSet(undefined)).toBeUndefined();
    });

    it('should parse without a hash', () => {
      expect(service.parseSet('1~2')).toEqual(new Set(['1', '2']));
    });

    it('should parse with a hash', () => {
      expect(service.parseSet('A~B', ['a', 'b'])).toEqual(new Set(['a', 'b']));
    });
  });
});
