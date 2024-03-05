import { TestBed } from '@angular/core/testing';

import { Mocks, TestModule } from 'src/tests';
import { LinkValue, MIN_LINK_VALUE, Rational, Step } from '~/models';
import { FlowService } from './flow.service';

describe('FlowService', () => {
  let service: FlowService;
  const fullStep: Step = {
    id: '0',
    items: Rational.two,
    belts: Rational.from(3),
    wagons: Rational.from(4),
    machines: Rational.from(5),
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
        Mocks.LightOilSteps,
        '/m',
        Mocks.ItemsStateInitial,
        Mocks.PreferencesState,
        Mocks.Dataset,
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });

    it('should handle different link text selection', () => {
      const result = service.buildGraph(
        Mocks.LightOilSteps,
        '/m',
        Mocks.ItemsStateInitial,
        { ...Mocks.PreferencesState, ...{ linkText: LinkValue.None } },
        Mocks.Dataset,
      );

      expect(result.nodes.length).toEqual(7);
      expect(result.links.length).toEqual(8);
    });
  });

  describe('stepLinkValue', () => {
    it('should handle all possible options', () => {
      expect(service.stepLinkValue(fullStep, LinkValue.None)).toEqual(
        Rational.one,
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Percent)).toEqual(
        Rational.one,
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Items)).toEqual(
        Rational.two,
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Belts)).toEqual(
        Rational.from(3),
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Wagons)).toEqual(
        Rational.from(4),
      );
      expect(service.stepLinkValue(fullStep, LinkValue.Machines)).toEqual(
        Rational.from(5),
      );
    });

    it('should handle undefined values', () => {
      expect(service.stepLinkValue(emptyStep, LinkValue.Items)).toEqual(
        Rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Belts)).toEqual(
        Rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Wagons)).toEqual(
        Rational.zero,
      );
      expect(service.stepLinkValue(emptyStep, LinkValue.Machines)).toEqual(
        Rational.zero,
      );
    });
  });

  describe('linkSize', () => {
    it('should handle all possible options', () => {
      expect(
        service.linkSize(
          Rational.one,
          Rational.one,
          LinkValue.None,
          Rational.one,
        ),
      ).toEqual(1);
      expect(
        service.linkSize(
          Rational.one,
          Rational.one,
          LinkValue.Percent,
          Rational.one,
        ),
      ).toEqual(1);
      expect(
        service.linkSize(
          Rational.one,
          Rational.one,
          LinkValue.Items,
          Rational.one,
        ),
      ).toEqual(1);
    });

    it('should fall back to minimum values', () => {
      expect(
        service.linkSize(
          Rational.one,
          Rational.zero,
          LinkValue.Percent,
          Rational.one,
        ),
      ).toEqual(MIN_LINK_VALUE);
      expect(
        service.linkSize(
          Rational.one,
          Rational.zero,
          LinkValue.Items,
          Rational.one,
        ),
      ).toEqual(MIN_LINK_VALUE);
    });
  });

  describe('linkText', () => {
    it('should handle all possible options', () => {
      expect(
        service.linkText(
          Rational.one,
          Rational.one,
          LinkValue.None,
          Mocks.PreferencesState.columns,
          '/m',
        ),
      ).toEqual('');
      expect(
        service.linkText(
          Rational.one,
          Rational.one,
          LinkValue.Percent,
          Mocks.PreferencesState.columns,
          '/m',
        ),
      ).toEqual('100%');
      expect(
        service.linkText(
          Rational.one,
          Rational.one,
          LinkValue.Items,
          Mocks.PreferencesState.columns,
          '/m',
        ),
      ).toEqual('1/m');
    });

    it('should handle null precision / remove suffix', () => {
      spyOn(service, 'linkPrecision').and.returnValue(null);
      expect(
        service.linkText(
          Rational.one,
          Rational.one,
          LinkValue.Machines,
          Mocks.PreferencesState.columns,
          '/m',
        ),
      ).toEqual('1');
    });
  });

  describe('linkPrecision', () => {
    it('should handle all possible options', () => {
      expect(
        service.linkPrecision(LinkValue.None, Mocks.PreferencesState.columns),
      ).toEqual(null);
      expect(
        service.linkPrecision(
          LinkValue.Percent,
          Mocks.PreferencesState.columns,
        ),
      ).toEqual(null);
      expect(
        service.linkPrecision(LinkValue.Items, Mocks.PreferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(LinkValue.Belts, Mocks.PreferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(LinkValue.Wagons, Mocks.PreferencesState.columns),
      ).toEqual(1);
      expect(
        service.linkPrecision(
          LinkValue.Machines,
          Mocks.PreferencesState.columns,
        ),
      ).toEqual(1);
    });
  });
});
