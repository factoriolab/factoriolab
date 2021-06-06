import {
  Dataset,
  LinkValue,
  MIN_LINK_VALUE,
  Rational,
  SankeyData,
  Step,
} from '~/models';

export class FlowUtility {
  static buildSankey(
    steps: Step[],
    linkSize: LinkValue,
    linkText: LinkValue,
    linkPrecision: number,
    data: Dataset
  ): SankeyData {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };

    for (const step of steps) {
      const text = this.stepLinkValue(step, linkText);
      const value =
        linkText === linkSize ? text : this.stepLinkValue(step, linkSize);

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
            const item = data.itemEntities[step.itemId];
            sankey.links.push({
              target: i,
              source: step.recipeId,
              value: this.linkSize(
                value,
                step.parents[i],
                linkSize,
                item.stack
              ),
              text: this.linkText(
                text,
                step.parents[i],
                linkText,
                linkPrecision
              ),
              name: item.name,
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
          const outText = this.stepLinkValue(outStep, linkText);
          const outValue =
            linkText === linkSize
              ? outText
              : this.stepLinkValue(outStep, linkSize);
          const percent = step.outputs[outId];
          const item = data.itemEntities[outId];
          sankey.links.push({
            target: outId,
            source: step.recipeId,
            value: this.linkSize(outValue, percent, linkSize, item.stack),
            text: this.linkText(outValue, percent, linkText, linkPrecision),
            name: item.name,
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
                value: this.linkSize(
                  value,
                  step.parents[i],
                  linkSize,
                  item.stack
                ),
                text: this.linkText(
                  text,
                  step.parents[i],
                  linkText,
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

  static stepLinkValue(step: Step, prop: LinkValue): Rational {
    if (prop === LinkValue.None || prop === LinkValue.Percent) {
      return Rational.one;
    }
    
    let value: Rational;

    switch (prop) {
      case LinkValue.Belts:
        value = step.belts;
      case LinkValue.Wagons:
        value = step.wagons;
      case LinkValue.Factories:
        value = step.factories;
      default:
        value = step.items;
    }
    
    return value || Rational.zero;
  }

  static linkSize(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    stack: number
  ): number {
    if (prop === LinkValue.None) {
      return 1;
    }

    if (prop === LinkValue.Percent) {
      return percent.toNumber() || MIN_LINK_VALUE;
    }

    // Scale link size for fluids to 1/10
    if (prop === LinkValue.Items && !stack) {
      value = value.div(Rational.from(10));
    }

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  static linkText(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    precision: number
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
