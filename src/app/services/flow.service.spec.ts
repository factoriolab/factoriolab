import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { MIN_LINK_VALUE } from '~/models/constants';
import { LinkValue } from '~/models/enum/link-value';
import { rational } from '~/models/rational';
import { Step } from '~/models/step';
import { Mocks, TestModule } from '~/tests';

import { FlowService } from './flow.service';

describe('FlowService', () => {
  let service: FlowService;
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
    service = TestBed.inject(FlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('recipeStepNodeType', () => {
    it('should return different prefix for recipe objective steps', () => {
      expect(service.recipeStepNodeType({} as any)).toEqual('r');
      expect(
        service.recipeStepNodeType({ recipeObjectiveId: 'obj' } as any),
      ).toEqual('m');
    });
  });

  describe('buildGraph', () => {
    it('should handle various link and node types', () => {
      const result = service.buildGraph(
        Mocks.lightOilSteps,
        '/m',
        Mocks.settingsStateInitial,
        Mocks.preferencesState,
        Mocks.adjustedDataset,
        Mocks.themeValues,
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });

    it('should handle different link text selection', () => {
      const result = service.buildGraph(
        Mocks.lightOilSteps,
        '/m',
        Mocks.settingsStateInitial,
        spread(Mocks.preferencesState, {
          flowSettings: spread(Mocks.flowSettings, {
            linkText: LinkValue.None,
          }),
        }),
        Mocks.adjustedDataset,
        Mocks.themeValues,
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });

    it('should handle missing recipeId on parent', () => {
      const steps = [...Mocks.lightOilSteps];
      const broken = spread(steps[1], { parents: { '4': rational.one } });
      steps[1] = broken;
      const result = service.buildGraph(
        steps,
        '/m',
        Mocks.settingsStateInitial,
        Mocks.preferencesState,
        Mocks.adjustedDataset,
        Mocks.themeValues,
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(7);
    });
  });

  describe('stepLinkValue', () => {
    it('should handle all possible options', () => {
      expect(service.stepLinkValue(fullStep, LinkValue.None)).toEqual(
        rational.one,
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Percent)).toEqual(
        rational.one,
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Items)).toEqual(
        rational(2n),
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Belts)).toEqual(
        rational(3n),
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Wagons)).toEqual(
        rational(4n),
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Machines)).toEqual(
        rational(5n),
      );
    });

    it('should handle undefined values', () => {
      expect(service.stepLinkValue(emptyStep, LinkValue.Items)).toEqual(
        rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Belts)).toEqual(
        rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Wagons)).toEqual(
        rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Machines)).toEqual(
        rational.zero,
      );
    });
  });

  describe('linkSize', () => {
    it('should handle all possible options', () => {
      expect(
        service.linkSize(
          rational.one,
          rational.one,
          LinkValue.None,
          rational.one,
        ),
      ).toEqual(1);
      expect(
        service.linkSize(
          rational.one,
          rational.one,
          LinkValue.Percent,
          rational.one,
        ),
      ).toEqual(1);
      expect(
        service.linkSize(
          rational.one,
          rational.one,
          LinkValue.Items,
          rational.one,
        ),
      ).toEqual(1);
    });

    it('should fall back to minimum values', () => {
      expect(
        service.linkSize(
          rational.one,
          rational.zero,
          LinkValue.Percent,
          rational.one,
        ),
      ).toEqual(MIN_LINK_VALUE);
      expect(
        service.linkSize(
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
        service.linkText(
          rational.one,
          rational.one,
          LinkValue.None,
          Mocks.preferencesState.columns,
          '/m',
        ),
      ).toEqual('');
      expect(
        service.linkText(
          rational.one,
          rational.one,
          LinkValue.Percent,
          Mocks.preferencesState.columns,
          '/m',
        ),
      ).toEqual('100%');
      expect(
        service.linkText(
          rational.one,
          rational.one,
          LinkValue.Items,
          Mocks.preferencesState.columns,
          '/m',
        ),
      ).toEqual('1/m');
    });

    it('should handle null precision / remove suffix', () => {
      spyOn(service, 'linkPrecision').and.returnValue(null);
      expect(
        service.linkText(
          rational.one,
          rational.one,
          LinkValue.Machines,
          Mocks.preferencesState.columns,
          '/m',
        ),
      ).toEqual('1');
    });
  });

  describe('linkPrecision', () => {
    it('should handle all possible options', () => {
      expect(
        service.linkPrecision(LinkValue.None, Mocks.preferencesState.columns),
      ).toEqual(null);
      expect(
        service.linkPrecision(
          LinkValue.Percent,
          Mocks.preferencesState.columns,
        ),
      ).toEqual(null);
      expect(
        service.linkPrecision(LinkValue.Items, Mocks.preferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(LinkValue.Belts, Mocks.preferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(LinkValue.Wagons, Mocks.preferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(
          LinkValue.Machines,
          Mocks.preferencesState.columns,
        ),
      ).toEqual(1);
    });
  });
});
