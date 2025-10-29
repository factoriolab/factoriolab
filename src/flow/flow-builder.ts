import { computed, inject, Injectable } from '@angular/core';

import { IconData } from '~/data/schema/icon-data';
import { Rational, rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { ColumnsState } from '~/state/preferences/columns-state';
import { LinkValue } from '~/state/preferences/link-value';
import { PreferencesState } from '~/state/preferences/preferences-state';
import { PreferencesStore } from '~/state/preferences/preferences-store';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { AdjustedDataset } from '~/state/settings/dataset';
import { displayRateInfo } from '~/state/settings/display-rate';
import { Settings } from '~/state/settings/settings';
import { SettingsStore } from '~/state/settings/settings-store';
import { Translate } from '~/translate/translate';

import { FlowData } from './flow-data';

export const MIN_LINK_VALUE = 1e-10;

@Injectable({ providedIn: 'root' })
export class FlowBuilder {
  private readonly objectivesStore = inject(ObjectivesStore);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly recipesStore = inject(RecipesStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly translate = inject(Translate);

  flowData = computed(() => {
    const steps = this.objectivesStore.steps();
    const settings = this.settingsStore.settings();
    const preferences = this.preferencesStore.state();
    const data = this.recipesStore.adjustedDataset();
    const suffixKey = displayRateInfo[settings.displayRate].suffix;
    const suffix = this.translate.get(suffixKey);
    return this.buildGraph(steps, suffix, settings, preferences, data);
  });

  recipeStepNodeType(step: Step): string {
    return step.recipeObjectiveId ? 'm' : 'r';
  }

  buildGraph(
    steps: Step[],
    suffix: string,
    settings: Settings,
    preferences: PreferencesState,
    data: AdjustedDataset,
  ): FlowData {
    const itemPrec = preferences.columns.items.precision;
    const machinePrec = preferences.columns.machines.precision;
    const flow: FlowData = {
      nodes: [],
      links: [],
    };

    const stepItemMap: Record<string, Step> = {};
    const stepValue: Record<string, Rational> = {};
    const stepText: Record<string, Rational> = {};
    const stepMap = steps.reduce<Record<string, Step>>((e, s) => {
      if (s.itemId) stepItemMap[s.itemId] = s;
      e[s.id] = s;
      stepValue[s.id] = this.stepLinkValue(
        s,
        preferences.flowSettings.linkSize,
      );
      stepText[s.id] =
        preferences.flowSettings.linkText === preferences.flowSettings.linkSize
          ? stepValue[s.id]
          : this.stepLinkValue(s, preferences.flowSettings.linkText);
      return e;
    }, {});

    for (const step of steps) {
      if (
        step.itemId &&
        step.items &&
        (!preferences.flowSettings.hideExcluded ||
          !settings.excludedItemIds.has(step.itemId))
      ) {
        const item = data.itemRecord[step.itemId];
        const icon = data.iconRecord.item[item.id];
        const id = `i|${step.itemId}`;
        flow.nodes.push({
          id,
          name: item.name,
          text: `${step.items.toString(itemPrec)}${suffix}`,
          color: icon.color,
          stepId: step.id,
          href: data.iconFile,
          ...this.positionProps(icon),
        });

        if (step.parents) {
          for (const stepId of Object.keys(step.parents)) {
            if (stepId === '') continue; // Ignore outputs

            const parent = stepMap[stepId];
            if (parent.recipeId == null) continue;

            flow.links.push({
              source: id,
              target: `${this.recipeStepNodeType(parent)}|${parent.recipeId}`,
              name: item.name,
              text: this.linkText(
                stepText[step.id],
                step.parents[stepId],
                preferences.flowSettings.linkText,
                preferences.columns,
                suffix,
              ),
              color: icon.color,
              value: this.linkSize(
                stepValue[step.id],
                step.parents[stepId],
                preferences.flowSettings.linkSize,
                item.stack,
              ),
            });
          }
        }

        if (step.surplus) {
          const surplusId = `s|${step.itemId}`;
          const percent = step.surplus.div(step.items);
          flow.nodes.push({
            id: surplusId,
            name: item.name,
            text: `${step.surplus.toString(itemPrec)}${suffix}`,
            color: 'var(--color-complement-500)',
            stepId: step.id,
            href: data.iconFile,
            ...this.positionProps(icon),
          });
          flow.links.push({
            source: id,
            target: surplusId,
            name: item.name,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.flowSettings.linkText,
              preferences.columns,
              suffix,
            ),
            color: icon.color,
            value: this.linkSize(
              stepValue[step.id],
              percent,
              preferences.flowSettings.linkSize,
              item.stack,
            ),
          });
        }

        if (step.output) {
          const outputId = `o|${step.itemId}`;
          const percent = step.output.div(step.items);
          flow.nodes.push({
            id: outputId,
            name: item.name,
            text: `${step.output.toString(itemPrec)}${suffix}`,
            color: 'var(--color-brand-500)',
            stepId: step.id,
            href: data.iconFile,
            ...this.positionProps(icon),
          });
          flow.links.push({
            source: id,
            target: outputId,
            name: item.name,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.flowSettings.linkText,
              preferences.columns,
              suffix,
            ),
            color: icon.color,
            value: this.linkSize(
              stepValue[step.id],
              percent,
              preferences.flowSettings.linkSize,
              item.stack,
            ),
          });
        }
      }

      if (step.recipeId && step.machines && step.recipeSettings?.machineId) {
        const recipe = data.recipeRecord[step.recipeId];
        const machine = data.itemRecord[step.recipeSettings?.machineId];
        const icon = data.iconRecord.recipe[recipe.id];
        const id = `${this.recipeStepNodeType(step)}|${step.recipeId}`;
        flow.nodes.push({
          id,
          name: recipe.name,
          text: `${step.machines.toString(machinePrec)} ${machine.name}`,
          color: icon.color,
          stepId: step.id,
          href: data.iconFile,
          recipe,
          ...this.positionProps(icon),
        });

        if (step.outputs) {
          for (const itemId of Object.keys(step.outputs).filter(
            (i) =>
              !preferences.flowSettings.hideExcluded ||
              !settings.excludedItemIds.has(i),
          )) {
            const itemStep = stepItemMap[itemId];
            const item = data.itemRecord[itemId];
            const icon = data.iconRecord.item[item.id];
            flow.links.push({
              source: id,
              target: `i|${itemId}`,
              name: item.name,
              text: this.linkText(
                stepText[itemStep.id],
                step.outputs[itemId],
                preferences.flowSettings.linkText,
                preferences.columns,
                suffix,
              ),
              color: icon.color,
              value: this.linkSize(
                stepValue[itemStep.id],
                step.outputs[itemId],
                preferences.flowSettings.linkSize,
                item.stack,
              ),
            });
          }
        }
      }
    }

    // Remove unnecessary item nodes
    const removeNodes = new Map<string, string>();
    for (const node of flow.nodes) {
      if (node.id.startsWith('i')) {
        const links = flow.links.filter((l) => l.target === node.id);
        if (links.length === 1) {
          const link = links[0];
          removeNodes.set(link.target, link.source);
        }
      }
    }

    flow.nodes = flow.nodes.filter((n) => !removeNodes.has(n.id));
    flow.links = flow.links.filter((l) => !removeNodes.has(l.target));
    flow.links.forEach(
      (l) => (l.source = removeNodes.get(l.source) ?? l.source),
    );

    return flow;
  }

  stepLinkValue(step: Step, prop: LinkValue): Rational {
    if (prop === LinkValue.None || prop === LinkValue.Percent)
      return rational.one;

    switch (prop) {
      case LinkValue.Belts:
        return step.belts ?? rational.zero;
      case LinkValue.Wagons:
        return step.wagons ?? rational.zero;
      case LinkValue.Machines:
        return step.machines ?? rational.zero;
      default:
        return step.items ?? rational.zero;
    }
  }

  positionProps(icon: IconData): {
    posX: string;
    posY: string;
    viewBox: string;
  } {
    const [posX, posY] = icon.position.split(' ');
    const viewBox = `${icon.position.replace(/px/g, '').replace(/-/g, '')} 64 64`;
    return { posX, posY, viewBox };
  }

  linkSize(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    stack: Rational | undefined,
  ): number {
    if (prop === LinkValue.None) return 1;

    if (prop === LinkValue.Percent) return percent.toNumber() || MIN_LINK_VALUE;

    // Scale link size for fluids to 1/10
    if (prop === LinkValue.Items && stack == null)
      value = value.div(rational(10n));

    return value.mul(percent).toNumber() || MIN_LINK_VALUE;
  }

  linkText(
    value: Rational,
    percent: Rational,
    prop: LinkValue,
    columns: ColumnsState,
    rateSuffix: string,
  ): string {
    switch (prop) {
      case LinkValue.None:
        return '';
      case LinkValue.Percent:
        return `${Math.round(percent.mul(rational(100n)).toNumber()).toString()}%`;
      default: {
        const suffix = [LinkValue.Items, LinkValue.Wagons].includes(prop)
          ? rateSuffix
          : '';
        const result = value.mul(percent);
        const precision = this.linkPrecision(prop, columns);
        if (precision == null) return result.toFraction() + suffix;
        return result.toPrecision(precision).toString() + suffix;
      }
    }
  }

  linkPrecision(prop: LinkValue, columns: ColumnsState): number | null {
    switch (prop) {
      case LinkValue.None:
      case LinkValue.Percent:
        return null;
      case LinkValue.Items:
        return columns.items.precision;
      case LinkValue.Belts:
        return columns.belts.precision;
      case LinkValue.Wagons:
        return columns.wagons.precision;
      case LinkValue.Machines:
        return columns.machines.precision;
    }
  }
}
