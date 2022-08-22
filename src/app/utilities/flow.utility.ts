import {
  Column,
  Dataset,
  DisplayRate,
  displayRateLabel,
  Entities,
  LinkValue,
  MIN_LINK_VALUE,
  Rational,
  RecipeSettings,
  SankeyData,
  Step,
} from '~/models';
import { ColumnsState } from '~/store/preferences';

export class FlowUtility {
  static buildGraph(
    steps: Step[],
    displayRate: DisplayRate,
    linkSize: LinkValue,
    linkText: LinkValue,
    linkPrecision: number | null,
    columns: ColumnsState,
    recipeSettings: Entities<RecipeSettings>,
    data: Dataset
  ): SankeyData {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };

    for (const step of steps) {
      if (step.recipeId && step.factories) {
        const recipe = data.recipeEntities[step.recipeId];
        const settings = recipeSettings[step.recipeId];
        const icon = data.iconEntities[step.recipeId];

        if (settings.factoryId == null) break;
        const factory = data.itemEntities[settings.factoryId];
        sankey.nodes.push({
          id: `r|${step.recipeId}`,
          stepId: step.id,
          viewBox: '',
          href: recipe.id,
          name: recipe.name,
          subtext:
            step.factories.toString(columns[Column.Factories].precision) +
            ' ' +
            factory.name,
          color: Object.keys(recipe.in).length === 0 ? '#CBD5E1' : '#93C5FD',
          recipe,
          factoryId: settings.factoryId,
          factories: step.factories.toString(
            columns[Column.Factories].precision
          ),
        });
      }

      if (step.itemId) {
        const item = data.itemEntities[step.itemId];
        const icon = data.iconEntities[step.itemId];
        if (step.surplus) {
          // need to create a surplus node
          sankey.nodes.push({
            id: `s|${step.itemId}`,
            stepId: step.id,
            viewBox: '',
            href: 'aaaa',
            name: item.name + ' surplus..',
            subtext: '...',
            color: '#FCA5A5',
          });
          // need to draw lines from each recipe
          for (const sourceStep of steps) {
            if (sourceStep.recipeId && sourceStep.outputs) {
              if (sourceStep.outputs[step.itemId]) {
                const sourceAmount = step.surplus.mul(
                  sourceStep.outputs[step.itemId]
                );
                sankey.links.push({
                  source: `r|${sourceStep.recipeId}`,
                  target: `s|${step.itemId}`,
                  name: item.name,
                  color: icon.color,
                  value: sourceAmount.toNumber(),
                  text: 'surplus',
                });
              }
            }
          }
        }

        if (step.items) {
          let itemAmt = step.items;
          if (step.parents) {
            // need to draw lines to each requested recipe
            for (const targetId of Object.keys(step.parents)) {
              // this is how much is requested by that recipe, but need recipe source
              const targetAmount = step.items.mul(step.parents[targetId]);
              let amount = targetAmount;
              itemAmt = itemAmt.sub(amount);
              for (const sourceStep of steps) {
                if (sourceStep.recipeId && sourceStep.outputs) {
                  if (sourceStep.outputs[step.itemId]) {
                    // this source step produces this item
                    const sourceAmount = targetAmount.mul(
                      sourceStep.outputs[step.itemId]
                    );
                    amount = amount.sub(sourceAmount);
                    sankey.links.push({
                      source: `r|${sourceStep.recipeId}`,
                      target: `r|${targetId}`,
                      name: item.name,
                      color: icon.color,
                      value: sourceAmount.toNumber(),
                      text:
                        sourceAmount.toString(columns[Column.Items].precision) +
                        displayRateLabel[displayRate],
                    });
                  }
                }
              }

              if (amount.gt(Rational.zero)) {
                // need input node
                sankey.nodes.push({
                  id: `i|${step.itemId}`,
                  stepId: step.id,
                  viewBox: 'aa',
                  href: 'aa',
                  name: item.name + ' input..',
                  subtext: '...',
                  color: 'red',
                });
                // need to draw lines TO each recipe
                for (const targetId of Object.keys(step.parents)) {
                  // how much is requested by this recipe? not sure yet.
                  const targetAmount = step.items.mul(step.parents[targetId]);
                  sankey.links.push({
                    source: `i|${step.itemId}`,
                    target: `r|${targetId}`,
                    name: item.name,
                    color: icon.color,
                    value: 1,
                    text: 'inputtt',
                  });
                }
              }
            }
          }

          if (itemAmt.gt(step.surplus || Rational.zero)) {
            // need output node
            sankey.nodes.push({
              id: `o|${step.itemId}`,
              stepId: step.id,
              viewBox: 'aa',
              href: 'aa',
              name: item.name + ' output..',
              subtext:
                itemAmt
                  .sub(step.surplus || Rational.zero)
                  .toString(columns[Column.Items].precision) +
                displayRateLabel[displayRate],
              color: '#86EFAC',
            });
            for (const sourceStep of steps) {
              if (sourceStep.recipeId && sourceStep.outputs) {
                if (sourceStep.outputs[step.itemId]) {
                  sankey.links.push({
                    source: `r|${sourceStep.recipeId}`,
                    target: `o|${step.itemId}`,
                    name: item.name,
                    color: icon.color,
                    value: 1,
                    text:
                      itemAmt
                        .sub(step.surplus || Rational.zero)
                        .mul(sourceStep.outputs[step.itemId])
                        .toString(columns[Column.Items].precision) +
                      displayRateLabel[displayRate],
                  });
                }
              }
            }
          }
        }
      }
    }

    return sankey;
  }

  static stepLinkValue(step: Step, prop: LinkValue): Rational {
    if (prop === LinkValue.None || prop === LinkValue.Percent) {
      return Rational.one;
    }

    let value: Rational | undefined;

    switch (prop) {
      case LinkValue.Belts:
        value = step.belts;
        break;
      case LinkValue.Wagons:
        value = step.wagons;
        break;
      case LinkValue.Factories:
        value = step.factories;
        break;
      default:
        value = step.items;
        break;
    }

    return value || Rational.zero;
  }

  static linkSize(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    stack: Rational | undefined
  ): number {
    if (prop === LinkValue.None) {
      return 1;
    }

    if (prop === LinkValue.Percent) {
      return percent.toNumber() || MIN_LINK_VALUE;
    }

    // Scale link size for fluids to 1/10
    if (prop === LinkValue.Items && stack == null) {
      value = value.div(Rational.from(10));
    }

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  static linkText(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    precision: number | null
  ): string {
    switch (prop) {
      case LinkValue.None:
        return '';
      case LinkValue.Percent:
        return `${Math.round(percent.mul(Rational.hundred).toNumber())}%`;
      default: {
        const result = value.mul(percent);
        if (precision == null) {
          return result.toFraction();
        } else {
          return result.toPrecision(precision).toString();
        }
      }
    }
  }
}
