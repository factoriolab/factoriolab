import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Link,
  LinkValue,
  MIN_LINK_VALUE,
  Node,
  Rational,
  Step,
} from '~/models';
import { FlowUtility } from './flow.utility';

describe('FlowUtility', () => {
  describe('getSankey', () => {
    const node: Node = {
      id: ItemId.Coal,
      stepId: '0',
      name: Mocks.AdjustedData.itemEntities[ItemId.Coal].name,
      color: Mocks.AdjustedData.iconEntities[ItemId.Coal].color,
      viewBox: '128 384 64 64',
      href: Mocks.AdjustedData.iconEntities[ItemId.Coal].file!,
    };
    const iId = `i|${ItemId.Coal}`;
    const rId = `r|${RecipeId.Coal}`;

    it('should handle normal steps', () => {
      const result = FlowUtility.buildSankey(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            recipeId: RecipeId.Coal,
            parents: { [ItemId.PlasticBar]: Rational.one },
          },
          {
            id: '1',
            itemId: ItemId.PlasticBar,
            recipeId: RecipeId.PlasticBar,
          },
        ] as any[],
        LinkValue.None,
        LinkValue.None,
        null,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        nodes: [
          node,
          {
            id: ItemId.PlasticBar,
            stepId: '1',
            name: Mocks.AdjustedData.itemEntities[ItemId.PlasticBar].name,
            color: Mocks.AdjustedData.iconEntities[ItemId.PlasticBar].color,
            viewBox: '768 384 64 64',
            href: Mocks.AdjustedData.iconEntities[ItemId.PlasticBar].file!,
          },
        ],
        links: [
          {
            target: ItemId.PlasticBar,
            source: ItemId.Coal,
            value: 1,
            text: '',
            name: Mocks.AdjustedData.itemEntities[ItemId.Coal].name,
            color: Mocks.AdjustedData.iconEntities[ItemId.Coal].color,
          },
        ],
      });
    });

    it('should handle mismatched step', () => {
      const result = FlowUtility.buildSankey(
        [
          { id: '0', itemId: ItemId.Coal, items: Rational.one },
          {
            id: '1',
            recipeId: RecipeId.Coal,
            factories: Rational.one,
            outputs: {},
          },
        ] as any[],
        LinkValue.None,
        LinkValue.None,
        null,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        nodes: [
          { ...node, ...{ id: iId } },
          { ...node, ...{ id: rId, stepId: '1' } },
        ],
        links: [
          {
            target: iId,
            source: rId,
            value: 1,
            text: '',
            name: Mocks.AdjustedData.itemEntities[ItemId.Coal].name,
            color: Mocks.AdjustedData.iconEntities[ItemId.Coal].color,
          },
        ],
      });
    });

    it('should handle different text and size', () => {
      const result = FlowUtility.buildSankey(
        [
          { id: '0', itemId: ItemId.Coal, items: Rational.one },
          {
            id: '1',
            recipeId: RecipeId.Coal,
            factories: Rational.one,
            outputs: { [ItemId.Coal]: Rational.one },
            items: Rational.two,
          },
        ] as any[],
        LinkValue.Items,
        LinkValue.Percent,
        null,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        nodes: [
          { ...node, ...{ id: iId } },
          { ...node, ...{ id: rId, stepId: '1' } },
        ],
        links: [
          {
            target: iId,
            source: rId,
            value: 1,
            text: '100%',
            name: Mocks.AdjustedData.itemEntities[ItemId.Coal].name,
            color: Mocks.AdjustedData.iconEntities[ItemId.Coal].color,
          },
        ],
      });
    });

    it('should handle steps with no recipe', () => {
      const result = FlowUtility.buildSankey(
        [
          {
            id: '0',
            itemId: ItemId.Coal,
            parents: { [RecipeId.PlasticBar]: Rational.one },
          },
          {
            id: '1',
            recipeId: RecipeId.PlasticBar,
          },
        ] as any[],
        LinkValue.None,
        LinkValue.None,
        null,
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        nodes: [
          { ...node, ...{ id: iId } },
          {
            id: `r|${RecipeId.PlasticBar}`,
            stepId: '1',
            viewBox: '768 384 64 64',
            name: Mocks.AdjustedData.recipeEntities[RecipeId.PlasticBar].name,
            color: Mocks.AdjustedData.iconEntities[RecipeId.PlasticBar].color,
            href: Mocks.AdjustedData.iconEntities[RecipeId.PlasticBar].file!,
          },
        ],
        links: [
          {
            target: `r|${RecipeId.PlasticBar}`,
            source: iId,
            value: 1,
            text: '',
            name: Mocks.AdjustedData.itemEntities[ItemId.Coal].name,
            color: Mocks.AdjustedData.iconEntities[ItemId.Coal].color,
          },
        ],
      });
    });

    it('should handle recipe that matches id with extra outputs', () => {
      const recipe = Mocks.AdjustedData.recipeR[RecipeId.UraniumProcessing];
      spyOn(recipe, 'produces').and.returnValue(true);
      const result = FlowUtility.buildSankey(
        [
          {
            id: '0',
            itemId: RecipeId.UraniumProcessing,
            recipeId: RecipeId.UraniumProcessing,
            factories: Rational.one,
            outputs: {},
          },
          {
            id: '1',
            itemId: RecipeId.UraniumProcessing,
            recipeId: RecipeId.UraniumProcessing,
            factories: Rational.one,
            parents: {},
            outputs: {},
          },
          {
            id: '2',
            itemId: ItemId.Uranium235,
            items: Rational.zero,
          },
          {
            id: '3',
            itemId: ItemId.Uranium238,
            items: Rational.zero,
          },
        ] as any[],
        LinkValue.None,
        LinkValue.None,
        null,
        Mocks.AdjustedData
      );
      const name =
        Mocks.AdjustedData.recipeEntities[RecipeId.UraniumProcessing].name;
      const color =
        Mocks.AdjustedData.iconEntities[RecipeId.UraniumProcessing].color;
      const href =
        Mocks.AdjustedData.iconEntities[RecipeId.UraniumProcessing].file!;
      const uNode1: Node = {
        id: RecipeId.UraniumProcessing,
        stepId: '0',
        name,
        color,
        viewBox: '384 896 64 64',
        href,
      };
      const uNode2: Node = { ...uNode1, ...{ stepId: '1' } };
      const uNode3: Node = {
        id: `i|${ItemId.Uranium235}`,
        stepId: '2',
        name: Mocks.AdjustedData.itemEntities[ItemId.Uranium235].name,
        color: Mocks.AdjustedData.iconEntities[ItemId.Uranium235].color,
        viewBox: '384 512 64 64',
        href,
      };
      const uNode4: Node = {
        id: `i|${ItemId.Uranium238}`,
        stepId: '3',
        name: Mocks.AdjustedData.itemEntities[ItemId.Uranium238].name,
        color: Mocks.AdjustedData.iconEntities[ItemId.Uranium238].color,
        viewBox: '448 512 64 64',
        href,
      };
      const uLink1: Link = {
        target: `i|${ItemId.Uranium235}`,
        source: RecipeId.UraniumProcessing,
        value: 1,
        text: '',
        name: Mocks.AdjustedData.itemEntities[ItemId.Uranium235].name,
        color: Mocks.AdjustedData.iconEntities[ItemId.Uranium235].color,
      };
      const uLink2: Link = {
        target: `i|${ItemId.Uranium238}`,
        source: RecipeId.UraniumProcessing,
        value: 1,
        text: '',
        name: Mocks.AdjustedData.itemEntities[ItemId.Uranium238].name,
        color: Mocks.AdjustedData.iconEntities[ItemId.Uranium238].color,
      };
      expect(result).toEqual({
        nodes: [uNode1, uNode2, uNode3, uNode4],
        links: [uLink1, uLink2, uLink1, uLink2],
      });
    });
  });

  describe('stepLinkValue', () => {
    const step: Step = {
      id: 'id',
      itemId: ItemId.IronOre,
      items: Rational.from(5),
      surplus: Rational.from(3),
      belts: Rational.from(4),
      wagons: Rational.from(6),
      factories: Rational.from(7),
    };

    it('should return correct value for none', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.None)).toEqual(
        Rational.one
      );
    });

    it('should return correct value for percent', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.Percent)).toEqual(
        Rational.one
      );
    });

    it('should return correct value for factories when null', () => {
      expect(FlowUtility.stepLinkValue({} as any, LinkValue.Factories)).toEqual(
        Rational.zero
      );
    });

    it('should return correct value for belts', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.Belts)).toEqual(
        Rational.from(4)
      );
    });

    it('should return correct value for wagons', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.Wagons)).toEqual(
        Rational.from(6)
      );
    });

    it('should return correct value for factories', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.Factories)).toEqual(
        Rational.from(7)
      );
    });

    it('should return correct value for items', () => {
      expect(FlowUtility.stepLinkValue(step, LinkValue.Items)).toEqual(
        Rational.from(5)
      );
    });

    it('should return correct value for null items/surplus', () => {
      expect(FlowUtility.stepLinkValue({} as any, LinkValue.Items)).toEqual(
        Rational.zero
      );
    });
  });

  describe('linkValue', () => {
    it('should return correct value for none', () => {
      expect(
        FlowUtility.linkSize(
          Rational.zero,
          Rational.zero,
          LinkValue.None,
          Rational.hundred
        )
      ).toEqual(1);
    });

    it('should return correct value for percent', () => {
      expect(
        FlowUtility.linkSize(
          Rational.zero,
          Rational.two,
          LinkValue.Percent,
          Rational.hundred
        )
      ).toEqual(2);
    });

    it('should return minimum value for percent', () => {
      expect(
        FlowUtility.linkSize(
          Rational.zero,
          Rational.zero,
          LinkValue.Percent,
          Rational.hundred
        )
      ).toEqual(MIN_LINK_VALUE);
    });

    it('should multiply percent and value', () => {
      expect(
        FlowUtility.linkSize(
          Rational.two,
          new Rational(BigInt(3)),
          LinkValue.Factories,
          Rational.hundred
        )
      ).toEqual(6);
    });

    it('should return minimum value', () => {
      expect(
        FlowUtility.linkSize(
          Rational.zero,
          Rational.zero,
          LinkValue.Factories,
          Rational.hundred
        )
      ).toEqual(MIN_LINK_VALUE);
    });

    it('should scale link size for fluids', () => {
      expect(
        FlowUtility.linkSize(
          Rational.hundred,
          Rational.one,
          LinkValue.Items,
          undefined
        )
      ).toEqual(10);
    });
  });

  describe('linkDisp', () => {
    it('should return correct value for none', () => {
      expect(
        FlowUtility.linkText(Rational.zero, Rational.zero, LinkValue.None, null)
      ).toEqual('');
    });

    it('should return correct value for percent', () => {
      expect(
        FlowUtility.linkText(
          Rational.zero,
          Rational.one,
          LinkValue.Percent,
          null
        )
      ).toEqual('100%');
    });

    it('should return correct fractional value', () => {
      expect(
        FlowUtility.linkText(
          Rational.from(4, 3),
          Rational.one,
          LinkValue.Items,
          null
        )
      ).toEqual('1 + 1/3');
    });

    it('should return correct decimal value', () => {
      expect(
        FlowUtility.linkText(
          Rational.from(4, 3),
          Rational.one,
          LinkValue.Items,
          1
        )
      ).toEqual('1.4');
    });
  });
});
