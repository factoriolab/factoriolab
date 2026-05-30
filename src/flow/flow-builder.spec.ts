import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { initialColumnsState } from '~/state/preferences/columns-state';
import { initialFlowSettings } from '~/state/preferences/flow-settings';
import { LinkValue } from '~/state/preferences/link-value';
import { initialPreferencesState } from '~/state/preferences/preferences-state';
import { Mocks } from '~/tests/mocks/mocks';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { FlowBuilder, MIN_LINK_VALUE } from './flow-builder';

describe('FlowService', () => {
  let service: FlowBuilder;
  let mocks: Mocks;
  const fullStep: Step = {
    id: '0',
    items: rational(2n),
    belts: rational(3n),
    wagons: rational(4n),
    machines: rational(5n),
  };
  const emptyStep: Step = { id: '0' };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(FlowBuilder);
    mocks = TestBed.inject(Mocks);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('flowData', () => {
    it('should return null if no steps', () => {
      expect(service.flowData()).toBeNull();
    });

    it('should call to build the graph', () => {
      spyOn<any>(service, 'buildGraph');
      spyOn(service['objectivesStore'], 'steps').and.returnValue(mocks.steps());
      service['settingsStore'].iconColor.set({});
      expect(service.flowData()).toBeUndefined();
      expect(service['buildGraph']).toHaveBeenCalled();
    });
  });

  describe('recipeStepNodeType', () => {
    it('should return different prefix for recipe objective steps', () => {
      expect(service['recipeStepNodeType']({} as any)).toEqual('r');
      expect(
        service['recipeStepNodeType']({ recipeObjectiveId: 'obj' } as any),
      ).toEqual('m');
    });
  });

  describe('buildGraph', () => {
    it('should handle various link and node types', () => {
      const result = service['buildGraph'](
        mocks.lightOilSteps(),
        '/m',
        mocks.settingsStore.settings(),
        mocks.preferencesStore.state(),
        {},
        mocks.recipesStore.adjustedDataset(),
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });

    it('should handle different link text selection', () => {
      const result = service['buildGraph'](
        mocks.lightOilSteps(),
        '/m',
        mocks.settingsStore.settings(),
        spread(initialPreferencesState, {
          flowSettings: spread(initialFlowSettings, {
            linkText: LinkValue.None,
          }),
        }),
        {},
        mocks.recipesStore.adjustedDataset(),
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...mocks.lightOilSteps()];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      const result = service['buildGraph'](
        steps,
        '/m',
        mocks.settingsStore.settings(),
        mocks.preferencesStore.state(),
        {},
        mocks.recipesStore.adjustedDataset(),
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(7);
    });
  });

  describe('stepLinkValue', () => {
    it('should handle all possible options', () => {
      expect(service['stepLinkValue'](fullStep, LinkValue.None)).toEqual(
        rational.one,
      );
      expect(service['stepLinkValue'](fullStep, LinkValue.Percent)).toEqual(
        rational.one,
      );
      expect(service['stepLinkValue'](fullStep, LinkValue.Items)).toEqual(
        rational(2n),
      );
      expect(service['stepLinkValue'](fullStep, LinkValue.Belts)).toEqual(
        rational(3n),
      );
      expect(service['stepLinkValue'](fullStep, LinkValue.Wagons)).toEqual(
        rational(4n),
      );
      expect(service['stepLinkValue'](fullStep, LinkValue.Machines)).toEqual(
        rational(5n),
      );
    });

    it('should handle undefined values', () => {
      expect(service['stepLinkValue'](emptyStep, LinkValue.Items)).toEqual(
        rational.zero,
      );
      expect(service['stepLinkValue'](emptyStep, LinkValue.Belts)).toEqual(
        rational.zero,
      );
      expect(service['stepLinkValue'](emptyStep, LinkValue.Wagons)).toEqual(
        rational.zero,
      );
      expect(service['stepLinkValue'](emptyStep, LinkValue.Machines)).toEqual(
        rational.zero,
      );
    });
  });

  describe('linkSize', () => {
    it('should handle all possible options', () => {
      expect(
        service['linkSize'](
          rational.one,
          rational.one,
          LinkValue.None,
          rational.one,
        ),
      ).toEqual(1);
      expect(
        service['linkSize'](
          rational.one,
          rational.one,
          LinkValue.Percent,
          rational.one,
        ),
      ).toEqual(1);
      expect(
        service['linkSize'](
          rational.one,
          rational.one,
          LinkValue.Items,
          rational.one,
        ),
      ).toEqual(1);
    });

    it('should fall back to minimum values', () => {
      expect(
        service['linkSize'](
          rational.one,
          rational.zero,
          LinkValue.Percent,
          rational.one,
        ),
      ).toEqual(MIN_LINK_VALUE);
      expect(
        service['linkSize'](
          rational.one,
          rational.zero,
          LinkValue.Items,
          rational.one,
        ),
      ).toEqual(MIN_LINK_VALUE);
    });
  });

  describe('linkText', () => {
    it('should handle all possible options', () => {
      expect(
        service['linkText'](
          rational.one,
          rational.one,
          LinkValue.None,
          initialColumnsState,
          '/m',
        ),
      ).toEqual('');
      expect(
        service['linkText'](
          rational.one,
          rational.one,
          LinkValue.Percent,
          initialColumnsState,
          '/m',
        ),
      ).toEqual('100%');
      expect(
        service['linkText'](
          rational.one,
          rational.one,
          LinkValue.Items,
          initialColumnsState,
          '/m',
        ),
      ).toEqual('1/m');
    });

    it('should handle null precision / remove suffix', () => {
      spyOn<any>(service, 'linkPrecision').and.returnValue(null);
      expect(
        service['linkText'](
          rational.one,
          rational.one,
          LinkValue.Machines,
          initialColumnsState,
          '/m',
        ),
      ).toEqual('1');
    });
  });

  describe('linkPrecision', () => {
    it('should handle all possible options', () => {
      expect(
        service['linkPrecision'](LinkValue.None, initialColumnsState),
      ).toEqual(null);
      expect(
        service['linkPrecision'](LinkValue.Percent, initialColumnsState),
      ).toEqual(null);
      expect(
        service['linkPrecision'](LinkValue.Items, initialColumnsState),
      ).toEqual(1);
      expect(
        service['linkPrecision'](LinkValue.Belts, initialColumnsState),
      ).toEqual(1);
      expect(
        service['linkPrecision'](LinkValue.Wagons, initialColumnsState),
      ).toEqual(1);
      expect(
        service['linkPrecision'](LinkValue.Machines, initialColumnsState),
      ).toEqual(1);
    });
  });
});
