import {
  Dataset,
  Entities,
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
    linkPrecision: number | null,
    data: Dataset
  ): SankeyData {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };
    const iId: Entities = {};
    const rId: Entities = {};
    for (const step of steps) {
      if (
        step.recipeId != null &&
        step.itemId === step.recipeId &&
        data.recipeR[step.recipeId].produces(step.itemId)
      ) {
        iId[step.itemId] = step.itemId;
        rId[step.recipeId] = step.recipeId;
      } else {
        if (step.itemId != null) {
          iId[step.itemId] = `i|${step.itemId}`;
        }
        if (step.recipeId != null) {
          rId[step.recipeId] = `r|${step.recipeId}`;
        }
      }
    }

    for (const step of steps) {
      const text = this.stepLinkValue(step, linkText);
      const value =
        linkText === linkSize ? text : this.stepLinkValue(step, linkSize);
      let match = false;

      if (step.recipeId) {
        const recipe = data.recipeR[step.recipeId];
        const icon = data.iconEntities[step.recipeId];
        match = step.itemId === step.recipeId && recipe.produces(step.itemId);

        sankey.nodes.push({
          id: rId[step.recipeId],
          stepId: step.id,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
          name: recipe.name,
          color: icon.color,
        });

        if (match && step.parents && step.itemId) {
          for (const i of Object.keys(step.parents)) {
            if (rId[i]) {
              const item = data.itemEntities[step.itemId];
              sankey.links.push({
                target: rId[i],
                source: rId[step.recipeId],
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

        for (const outId of Object.keys(recipe.out).filter(
          (id) =>
            recipe.out[id].nonzero() &&
            (!match || (step.itemId !== id && !step.parents?.[id]))
        )) {
          const outStep = steps.find((s) => s.itemId === outId);
          if (outStep) {
            const outText = this.stepLinkValue(outStep, linkText);
            const outValue =
              linkText === linkSize
                ? outText
                : this.stepLinkValue(outStep, linkSize);
            if (step.outputs && iId[outId]) {
              const percent = step.outputs[outId];
              const item = data.itemEntities[outId];
              sankey.links.push({
                target: iId[outId],
                source: rId[step.recipeId],
                value: this.linkSize(outValue, percent, linkSize, item.stack),
                text: this.linkText(outText, percent, linkText, linkPrecision),
                name: item.name,
                color: data.iconEntities[outId].color,
              });
            }
          }
        }
      }

      if (step.itemId && !match) {
        const item = data.itemEntities[step.itemId];
        const icon = data.iconEntities[step.itemId];

        sankey.nodes.push({
          id: iId[step.itemId],
          stepId: step.id,
          viewBox: `${icon.position
            .replace(/px/g, '')
            .replace(/-/g, '')} 64 64`,
          href: icon.file,
          name: item.name,
          color: icon.color,
        });
        if (step.parents) {
          for (const i of Object.keys(step.parents)) {
            if (rId[i]) {
              const recipe = data.recipeR[i];
              if (recipe.in[step.itemId]) {
                sankey.links.push({
                  target: rId[i],
                  source: iId[step.itemId],
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
