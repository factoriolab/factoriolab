import {
  Dataset,
  DisplayRate,
  DisplayRateVal,
  LinkValue,
  MIN_LINK_VALUE,
  Rational,
  SankeyData,
  Step,
} from '~/models';

export class FlowUtility {
  static buildSankey(
    steps: Step[],
    linkValue: LinkValue,
    linkPrecision: number,
    displayRate: DisplayRate,
    data: Dataset
  ): SankeyData {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };

    for (const step of steps) {
      const value = this.stepLinkValue(step, linkValue);

      if (step.recipeId) {
        const recipe = data.recipeR[step.recipeId];
        const icon = data.iconEntities[step.recipeId];

        sankey.nodes.push({
          id: step.recipeId,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
          name: recipe.name,
          color: icon.color,
        });

        if (step.itemId === step.recipeId && step.parents) {
          for (const i of Object.keys(step.parents)) {
            sankey.links.push({
              target: i,
              source: step.recipeId,
              value: this.linkValue(value, step.parents[i], linkValue),
              dispValue: this.linkDisp(
                value,
                step.parents[i],
                linkValue,
                linkPrecision
              ),
              name: data.itemEntities[step.itemId].name,
              color: icon.color,
            });
          }
        }

        for (const outId of Object.keys(recipe.out).filter(
          (id) =>
            step.itemId !== step.recipeId ||
            (step.itemId !== id && !step.parents?.[id])
        )) {
          const outStep = steps.find((s) => s.itemId === outId);
          const outStepValue = step.factories
            .mul(recipe.out[outId])
            .div(recipe.time);
          const percent = outStepValue.div(
            outStep.items
              .add(outStep.surplus || Rational.zero)
              .div(DisplayRateVal[displayRate])
          );
          const outValue = this.stepLinkValue(outStep, linkValue);
          sankey.links.push({
            target: outId,
            source: step.recipeId,
            value: this.linkValue(outValue, percent, linkValue),
            dispValue: this.linkDisp(
              outValue,
              percent,
              linkValue,
              linkPrecision
            ),
            name: data.itemEntities[outId].name,
            color: data.iconEntities[outId].color,
          });
        }
      }

      if (step.itemId && step.itemId !== step.recipeId) {
        const item = data.itemEntities[step.itemId];
        const icon = data.iconEntities[step.itemId];

        sankey.nodes.push({
          id: step.itemId,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
          name: item.name,
          color: icon.color,
        });
        if (step.parents) {
          for (const i of Object.keys(step.parents)) {
            const recipe = data.recipeR[i];
            if (recipe.in?.[step.itemId]) {
              sankey.links.push({
                target: i,
                source: step.itemId,
                value: this.linkValue(value, step.parents[i], linkValue),
                dispValue: this.linkDisp(
                  value,
                  step.parents[i],
                  linkValue,
                  linkPrecision
                ),
                name: item.name,
                color: icon.color,
              });
            }
          }
        }
      }
    }

    return sankey;
  }

  static stepLinkValue(step: Step, linkValue: LinkValue): Rational {
    if (linkValue === LinkValue.None || linkValue === LinkValue.Percent) {
      return Rational.one;
    }

    if (linkValue === LinkValue.Factories && !step.factories) {
      // Step has no factories associated, return 0
      return Rational.zero;
    }

    switch (linkValue) {
      case LinkValue.Belts:
        return step.belts;
      case LinkValue.Wagons:
        return step.wagons;
      case LinkValue.Factories:
        return step.factories;
      default:
        return (step.items || Rational.zero).add(step.surplus || Rational.zero);
    }
  }

  static linkValue(
    value: Rational,
    percent: Rational,
    linkValue: LinkValue
  ): number {
    if (linkValue === LinkValue.None) {
      return 1;
    }

    if (linkValue === LinkValue.Percent) {
      return percent.toNumber() || MIN_LINK_VALUE;
    }

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  static linkDisp(
    value: Rational,
    percent: Rational,
    linkValue: LinkValue,
    linkPrecision: number
  ): string {
    switch (linkValue) {
      case LinkValue.None:
        return '';
      case LinkValue.Percent:
        return `${Math.round(percent.mul(Rational.hundred).toNumber())}%`;
      default:
        return `${value.mul(percent).toPrecision(linkPrecision)}`;
    }
  }
}
