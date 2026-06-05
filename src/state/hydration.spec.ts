import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';

import { Hydration } from './hydration';
import { ModuleSettings } from './module-settings';

describe('Hydration', () => {
  let service: Hydration;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Hydration);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('dehydrateModules', () => {
    it('should return undefined for default modules', () => {
      spyOn(service['options'], 'defaultModules').and.returnValue([]);
      const result = service.dehydrateModules([], [], [], rational.one);
      expect(result).toBeUndefined();
    });

    it('should reduce to minimum id and count settings', () => {
      const modules: ModuleSettings[] = [
        { count: rational(3n), id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.SpeedModule },
      ];
      const result = service.dehydrateModules(
        modules,
        [{ value: ItemId.ProductivityModule3, label: '' }],
        [ItemId.ProductivityModule3],
        rational(4n),
      );
      expect(result).toEqual(modules);
    });

    it('should default to zero module count', () => {
      const result = service.dehydrateModules(
        [{ count: rational.zero, id: ItemId.SpeedModule }],
        [{ value: ItemId.ProductivityModule3, label: '' }],
        [ItemId.ProductivityModule3],
        undefined,
      );
      expect(result).toEqual([{ id: ItemId.SpeedModule }]);
    });

    it('should filter out empty objects', () => {
      const result = service.dehydrateModules(
        [{ id: '' }],
        [{ value: ItemId.SpeedModule3, label: '' }],
        [ItemId.SpeedModule3],
        rational(2n),
      );
      expect(result).toEqual([]);
    });
  });

  describe('hydrateModules', () => {
    it('should return default modules', () => {
      spyOn(service['options'], 'defaultModules');
      service.hydrateModules(undefined, [], [], undefined);
      expect(service['options'].defaultModules).toHaveBeenCalled();
    });

    it('should restore modules and empty entry', () => {
      const result = service.hydrateModules(
        [{ count: rational.one }],
        [{ value: ItemId.ProductivityModule3, label: '' }],
        [ItemId.ProductivityModule3],
        rational(4n),
      );
      expect(result).toEqual([
        { count: rational.one, id: ItemId.ProductivityModule3 },
        { count: rational(3n), id: '' },
      ]);
    });

    it('should restore modules on unlimited entity', () => {
      const result = service.hydrateModules(
        [{}],
        [{ value: ItemId.ProductivityModule3, label: '' }],
        [ItemId.ProductivityModule3],
        true,
      );
      expect(result).toEqual([
        { count: rational.zero, id: ItemId.ProductivityModule3 },
      ]);
    });
  });

  describe('dehydrateBeacons', () => {
    it('should return undefined for default beacons', () => {
      expect(service.dehydrateBeacons([], [])).toBeUndefined();
    });

    it('should return value if default is empty/null', () => {
      expect(service.dehydrateBeacons([{}], [])).toEqual([{}]);
    });

    it('should reduce to minimum settings', () => {
      expect(
        service.dehydrateBeacons(
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational.one, id: ItemId.SpeedModule3 }],
            },
            {
              count: rational.one,
              id: ItemId.AdvancedCircuit,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
              total: rational.one,
            },
          ],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          modules: [{ count: rational.one }],
        },
        {
          count: rational.one,
          id: ItemId.AdvancedCircuit,
          modules: [{ id: ItemId.SpeedModule }],
          total: rational.one,
        },
      ]);
    });

    it('should filter out empty objects', () => {
      const result = service.dehydrateBeacons(
        [{ count: rational(2n) }],
        [{ count: rational(2n), id: ItemId.Beacon }],
      );
      expect(result).toEqual([]);
    });
  });

  describe('hydrateBeacons', () => {
    it('should handle empty inputs', () => {
      expect(service.hydrateBeacons(undefined, [])).toEqual([]);
      expect(service.hydrateBeacons([{}], [])).toEqual([{}]);
    });

    it('should restore beacons', () => {
      expect(
        service.hydrateBeacons(
          [{ modules: [{ count: rational.one }] }],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          count: rational(8n),
          id: ItemId.Beacon,
          modules: [
            { count: rational.one, id: ItemId.SpeedModule3 },
            { count: rational.one, id: '' },
          ],
          total: undefined,
        },
      ]);
    });

    it('should skip restoring empty slots if defaults have no module count', () => {
      expect(
        service.hydrateBeacons(
          [{ modules: [{ count: rational.one }] }],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          count: rational(8n),
          id: ItemId.Beacon,
          modules: [{ count: rational.one, id: ItemId.SpeedModule3 }],
          total: undefined,
        },
      ]);
    });
  });
});
