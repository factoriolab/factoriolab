import {
  Column,
  Dataset,
  DisplayRateInfo,
  Entities,
  FlowData,
  Rational,
  RecipeSettings,
  Step,
} from '~/models';
import { ColumnsState } from '~/store/preferences';

const COLOR_INPUT = '#CBD5E1'; // secondary color
const COLOR_RECIPE = '#93C5FD'; // primary color
const COLOR_SURPLUS = '#FCD34D'; // warn color
const COLOR_OUTPUT = '#86EFAC'; // success color

export class FlowUtility {
  static buildGraph(
    steps: Step[],
    dispRateInfo: DisplayRateInfo,
    columns: ColumnsState,
    recipeSettings: Entities<RecipeSettings>,
    data: Dataset
  ): FlowData {
    const flow: FlowData = {
      nodes: [],
      links: [],
    };

    const itemPrec = columns[Column.Items].precision;
    const rateLbl = dispRateInfo.label;

    for (const step of steps) {
      if (step.recipeId && step.factories) {
        const recipe = data.recipeEntities[step.recipeId];
        const settings = recipeSettings[step.recipeId];

        if (settings.factoryId == null) break;
        const factory = data.itemEntities[settings.factoryId];
        // CREATE NODE: Standard recipe
        flow.nodes.push({
          id: `r|${step.recipeId}`,
          name: recipe.name,
          text: `${step.factories.toString(itemPrec)} ${factory.name}`,
          color:
            Object.keys(recipe.in).length === 0 ? COLOR_INPUT : COLOR_RECIPE,
          recipe,
          factoryId: settings.factoryId,
          factories: step.factories.toString(
            columns[Column.Factories].precision
          ),
        });
      }

      if (step.itemId) {
        const item = data.itemEntities[step.itemId];
        if (step.surplus) {
          // CREATE NODE: Surplus
          flow.nodes.push({
            id: `s|${step.itemId}`,
            name: item.name,
            text: `${step.surplus.toString(itemPrec)}${rateLbl}`,
            color: COLOR_SURPLUS,
          });
          // Links to surplus node
          for (const sourceStep of steps) {
            if (sourceStep.recipeId && sourceStep.outputs) {
              if (sourceStep.outputs[step.itemId]) {
                const sourceAmount = step.surplus.mul(
                  sourceStep.outputs[step.itemId]
                );
                // CREATE LINK: Recipe -> Surplus
                flow.links.push({
                  source: `r|${sourceStep.recipeId}`,
                  target: `s|${step.itemId}`,
                  name: item.name,
                  text: `${sourceAmount.toString(itemPrec)}${rateLbl}`,
                });
              }
            }
          }
        }

        if (step.items) {
          let itemAmount = step.items;
          if (step.parents) {
            let inputAmount = Rational.zero;

            // Links to recipe node
            for (const targetId of Object.keys(step.parents)) {
              // This is how much is requested by that recipe, but need recipe source
              const targetAmount = step.items.mul(step.parents[targetId]);
              // Keep track of remaining amounts
              let amount = targetAmount;
              itemAmount = itemAmount.sub(amount);
              for (const sourceStep of steps) {
                if (sourceStep.recipeId && sourceStep.outputs) {
                  if (sourceStep.outputs[step.itemId]) {
                    // This source step produces this item
                    const sourceAmount = targetAmount.mul(
                      sourceStep.outputs[step.itemId]
                    );
                    amount = amount.sub(sourceAmount);
                    // CREATE LINK: Recipe -> Recipe
                    flow.links.push({
                      source: `r|${sourceStep.recipeId}`,
                      target: `r|${targetId}`,
                      name: item.name,
                      text: `${sourceAmount.toString(itemPrec)}${rateLbl}`,
                    });
                  }
                }
              }

              if (amount.gt(Rational.zero)) {
                inputAmount = inputAmount.add(amount);
                // CREATE LINK: Input -> Recipe
                flow.links.push({
                  source: `i|${step.itemId}`,
                  target: `r|${targetId}`,
                  name: item.name,
                  text: `${targetAmount.toString(itemPrec)}${rateLbl}`,
                });
              }
            }

            if (inputAmount.gt(Rational.zero)) {
              // CREATE NODE: Input
              flow.nodes.push({
                id: `i|${step.itemId}`,
                name: item.name,
                text: `${inputAmount.toString(itemPrec)}${rateLbl}`,
                color: COLOR_INPUT,
              });
            }
          }

          if (itemAmount.gt(step.surplus || Rational.zero)) {
            // CREATE NODE: Output
            flow.nodes.push({
              id: `o|${step.itemId}`,
              name: item.name,
              text: `${itemAmount
                .sub(step.surplus || Rational.zero)
                .toString(itemPrec)}${rateLbl}`,
              color: COLOR_OUTPUT,
            });
            for (const sourceStep of steps) {
              if (sourceStep.recipeId && sourceStep.outputs) {
                if (sourceStep.outputs[step.itemId]) {
                  // CREATE LINK: Recipe -> Output
                  flow.links.push({
                    source: `r|${sourceStep.recipeId}`,
                    target: `o|${step.itemId}`,
                    name: item.name,
                    text: `${itemAmount
                      .sub(step.surplus || Rational.zero)
                      .mul(sourceStep.outputs[step.itemId])
                      .toString(itemPrec)}${rateLbl}`,
                  });
                }
              }
            }
          }
        }
      }
    }

    return flow;
  }
}
