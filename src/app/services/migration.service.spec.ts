import { TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { ZipSection, ZNULL } from '~/models';
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
    it('should return latest version without alteration', () => {
      const originalParams = { [ZipSection.Version]: routerSvc.version };
      const { params } = service.migrate({ ...originalParams }, false);
      expect(params).toEqual(originalParams);
    });
  });

  describe('migrateV0', () => {
    it('should handle unrecognized/null baseid', () => {
      const { params } = service.migrateV0({
        params: { [ZipSection.Settings]: '---' },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Settings]).toEqual(ZNULL);
    });

    it('should handle preset without other settings', () => {
      const { params } = service.migrateV0({
        params: { [ZipSection.Mod]: '0' },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Settings]).toEqual('?**?*0');
    });
  });

  describe('migrateV2', () => {
    it('should handle undefined beaconCount', () => {
      const { params } = service.migrateV2({
        params: {
          [ZipSection.Recipes]: '***?',
          [ZipSection.Machines]: '**?',
        },
        warnings: [],
        isBare: false,
      });
      expect(params[ZipSection.Recipes]).toEqual('');
      expect(params[ZipSection.Machines]).toEqual('');
    });
  });

  describe('migrateV6', () => {
    it('should convert item objectives by machines into recipe objectives and into unified objective', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Objectives]: 'coal*1*3',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Objectives]).toEqual('coal*1*3');
    });

    it('should convert item objective by machines with limit step into maximize / limit recipe objectives and into unified objective', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Objectives]: 'iron-plate*1*3*iron-ore',
          [ZipSection.RecipeObjectives]: 'coal*1',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Objectives]).toEqual(
        'coal*1*3_iron-plate*1*3*2_iron-ore*1*3*3',
      );
      expect(params[ZipSection.RecipeObjectives]).toEqual('');
    });

    it('should convert item objective with limit step into maximize / limit item objectives', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Objectives]: 'iron-plate*1**iron-ore',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Objectives]).toEqual(
        'iron-plate*1**2_iron-ore*1**3',
      );
    });

    it('should remove item default recipe', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Items]: 'coal*1*transport-belt*cargo-wagon*coal',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Items]).toEqual(
        'coal*1*transport-belt*cargo-wagon',
      );
    });

    it('should convert disabled recipes into excluded recipes', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Settings]: '***coal',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Settings]).toEqual('');
      expect(params[ZipSection.Recipes]).toEqual('coal*1');
    });

    it('should convert disabled recipes into excluded recipes on existing recipe settings', () => {
      const { params } = service.migrateV6({
        params: {
          [ZipSection.Settings]: '***coal',
          [ZipSection.Recipes]: 'coal*electric-mining-drill',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[ZipSection.Settings]).toEqual('');
      expect(params[ZipSection.Recipes]).toEqual(
        'coal*1*electric-mining-drill',
      );
    });
  });

  describe('migrateV7', () => {
    it('should convert hashed objectives by machines to use items', () => {
      const { params } = service.migrateV7({
        params: {
          [ZipSection.Objectives]: 'Dc*1*3',
          [ZipSection.Settings]: '0**=*A**Po**A*0',
          [ZipSection.Version]: '7',
        },
        warnings: [],
        isBare: false,
      });
      expect(params[ZipSection.Objectives]).toEqual('Dc*1*0');
    });
  });

  describe('migrateV8', () => {
    it('should convert recipe objectives to unified objectives', () => {
      const { params } = service.migrateV8({
        params: {
          [ZipSection.Objectives]: 'steel-chest*1*1',
          [ZipSection.RecipeObjectives]: 'steel-chest*1',
        },
        warnings: [],
        isBare: true,
      });

      expect(params[ZipSection.Objectives]).toEqual(
        'steel-chest*1*1_steel-chest*1*3',
      );
    });
  });

  describe('migrateV9', () => {
    it('should handle migrating machine modules', () => {
      const { params } = service.migrateV9({
        params: {
          [ZipSection.Machines]: '1_A*speed-module',
        },
        warnings: [],
        isBare: true,
      });

      expect(params[ZipSection.Machines]).toEqual('=_A*0');
      expect(params[ZipSection.Modules]).toEqual('*speed-module');
    });

    it('should handle migrating fuel rank', () => {
      const { params } = service.migrateV9({
        params: {
          [ZipSection.Machines]: 'A',
          [ZipSection.Settings]: '*****coal',
        },
        warnings: [],
        isBare: true,
      });

      expect(params[ZipSection.Machines]).toEqual('***coal_A');
      expect(params[ZipSection.Settings]).toEqual('****');
    });
  });
});
