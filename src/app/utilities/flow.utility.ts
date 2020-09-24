import {
  Dataset,
  LinkValue,
  MIN_LINK_VALUE,
  Rational,
  RationalRecipe,
  SankeyData,
  Step,
} from '~/models';

export class FlowUtility {
  static buildSankey(steps: Step[], linkValue: LinkValue, data: Dataset) {
    const sankey: SankeyData = {
      nodes: [],
      links: [],
    };

    for (const step of steps) {
      const value = this.stepLinkValue(step, linkValue);

      if (step.recipeId) {
        const recipe = this.nonCircularRecipe(data.recipeR[step.recipeId]);
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

        if (step.itemId === step.recipeId) {
          if (step.parents) {
            for (const i of Object.keys(step.parents)) {
              sankey.links.push({
                target: i,
                source: step.recipeId,
                value: this.linkValue(value, step.parents[i], linkValue),
                name: data.itemEntities[step.itemId].name,
                color: icon.color,
              });
            }
          }
        } else {
          for (const outId of Object.keys(recipe.out)) {
            const outStep = steps.find((s) => s.itemId === outId);
            const outValue = this.stepLinkValue(outStep, linkValue);
            sankey.links.push({
              target: outId,
              source: step.recipeId,
              value: this.linkValue(outValue, Rational.one, linkValue),
              name: data.itemEntities[outId].name,
              color: data.iconEntities[outId].color,
            });
          }
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
            const lVal = this.linkValue(value, step.parents[i], linkValue);
            const recipe = this.nonCircularRecipe(data.recipeR[i]);
            if (recipe.in?.[step.itemId]) {
              sankey.links.push({
                target: i,
                source: step.itemId,
                value: lVal,
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

  static stepLinkValue(step: Step, linkValue: LinkValue) {
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

  static linkValue(value: Rational, percent: Rational, linkValue: LinkValue) {
    if (linkValue === LinkValue.None) {
      return 1;
    }

    if (linkValue === LinkValue.Percent) {
      return percent.toNumber() || MIN_LINK_VALUE;
    }

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  static nonCircularRecipe(recipe: RationalRecipe) {
    if (!recipe.in || !recipe.out) {
      return recipe;
    }

    const result = { ...recipe };

    for (const outId of Object.keys(result.out)) {
      if (result.in[outId]) {
        if (result.in[outId].gt(result.out[outId])) {
          result.in[outId] = result.in[outId].sub(result.out[outId]);
          delete result.out[outId];
        } else {
          result.out[outId] = result.out[outId].sub(result.in[outId]);
          delete result.in[outId];
        }
      }
    }

    return result;
  }
}
