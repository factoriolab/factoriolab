import { computed, inject, Injectable } from '@angular/core';

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
import { coalesce } from '~/utils/nullish';

import { FlowData } from './flow-data';
import { Link } from './link';
import { Node } from './node';

export const MIN_LINK_VALUE = 1e-10;

@Injectable({ providedIn: 'root' })
export class FlowBuilder {
  private readonly objectivesStore = inject(ObjectivesStore);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly recipesStore = inject(RecipesStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly translate = inject(Translate);

  readonly flowData = computed(() => {
    const steps = this.objectivesStore.steps();
    const iconColor = this.settingsStore.iconColor.value();
    if (!steps.length || iconColor == null) return null;
    const settings = this.settingsStore.settings();
    const preferences = this.preferencesStore.state();
    const data = this.recipesStore.adjustedDataset();
    const suffixKey = displayRateInfo[settings.displayRate].suffix;
    const suffix = this.translate.get(suffixKey);
    return this.buildGraph(
      steps,
      suffix,
      settings,
      preferences,
      iconColor,
      data,
    );
  });

  recipeStepNodeType(step: Step): string {
    return step.recipeObjectiveId ? 'm' : 'r';
  }

  buildGraph(
    steps: Step[],
    suffix: string,
    settings: Settings,
    preferences: PreferencesState,
    iconColor: Record<string, string>,
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
        const qualityIcon = icon.quality
          ? data.iconRecord.quality[icon.quality.id]
          : undefined;
        const id = `i|${step.itemId}`;
        flow.nodes.push({
          id,
          name: item.name,
          text: `${step.items.toLocaleString(itemPrec)}${suffix}`,
          color: iconColor[icon.id],
          stepId: step.id,
          icon,
          qualityIcon,
        });

        if (step.parents) {
          for (const stepId of Object.keys(step.parents)) {
            if (stepId === '') continue; // Ignore outputs

            const parent = stepMap[stepId];
            if (parent.recipeId == null) continue;

            flow.links.push({
              source: id,
              target: `${this.recipeStepNodeType(parent)}|${parent.recipeId}`,
              text: this.linkText(
                stepText[step.id],
                step.parents[stepId],
                preferences.flowSettings.linkText,
                preferences.columns,
                suffix,
              ),
              color: iconColor[icon.id],
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
            text: `${step.surplus.toLocaleString(itemPrec)}${suffix}`,
            color: 'var(--color-complement-500)',
            stepId: step.id,
            icon,
            qualityIcon,
          });
          flow.links.push({
            source: id,
            target: surplusId,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.flowSettings.linkText,
              preferences.columns,
              suffix,
            ),
            color: iconColor[icon.id],
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
            text: `${step.output.toLocaleString(itemPrec)}${suffix}`,
            color: 'var(--color-brand-500)',
            stepId: step.id,
            icon,
            qualityIcon,
          });
          flow.links.push({
            source: id,
            target: outputId,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.flowSettings.linkText,
              preferences.columns,
              suffix,
            ),
            color: iconColor[icon.id],
            value: this.linkSize(
              stepValue[step.id],
              percent,
              preferences.flowSettings.linkSize,
              item.stack,
            ),
          });
        }
      }

      if (step.recipeId) {
        const recipe = data.recipeRecord[step.recipeId];
        const machine = step.recipeSettings?.machineId
          ? data.itemRecord[step.recipeSettings.machineId]
          : undefined;
        const icon = machine
          ? data.iconRecord.item[machine.id]
          : data.iconRecord.recipe[step.recipeId];
        const qualityIcon = icon?.quality
          ? data.iconRecord.quality[icon.quality.id]
          : undefined;
        const recipeIcon = data.iconRecord.recipe[recipe.id];
        const recipeQualityIcon = recipeIcon.quality
          ? data.iconRecord.quality[recipeIcon.quality.id]
          : undefined;
        const id = `${this.recipeStepNodeType(step)}|${step.recipeId}`;
        flow.nodes.push({
          id,
          name: recipe.name,
          text: coalesce(step.machines?.toLocaleString(machinePrec), ''),
          color: iconColor[recipeIcon.id],
          stepId: step.id,
          recipe,
          icon,
          qualityIcon,
          recipeIcon,
          recipeQualityIcon,
          recipeObjectiveId: step.recipeObjectiveId,
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
              text: this.linkText(
                stepText[itemStep.id],
                step.outputs[itemId],
                preferences.flowSettings.linkText,
                preferences.columns,
                suffix,
              ),
              color: iconColor[icon.id],
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
    const reTargetSources = new Map<string, string>();
    const reSourceTargets = new Map<string, string>();
    for (const node of flow.nodes) {
      if (!node.id.startsWith('i')) continue;

      let link = this.redundantBySource(node, flow);
      if (link) {
        reTargetSources.set(link.target, link.source);
        continue;
      }

      link = this.redundantByTarget(node, flow);
      if (link) reSourceTargets.set(link.source, link.target);
    }

    flow.nodes = flow.nodes.filter(
      (n) => !reTargetSources.has(n.id) && !reSourceTargets.has(n.id),
    );
    flow.links = flow.links.filter(
      (l) => !reTargetSources.has(l.target) && !reSourceTargets.has(l.source),
    );
    flow.links.forEach((l) => {
      l.source = reTargetSources.get(l.source) ?? l.source;
      l.target = reSourceTargets.get(l.target) ?? l.target;
    });

    // Mark bidirectional nodes
    flow.links.forEach((l) => {
      if (
        flow.links.some((m) => l.target === m.source && l.source === m.target)
      )
        l.bidi = true;
    });

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
        return `${result.toLocaleString(precision)}${suffix}`;
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

  /**
   * Determines whether a node has a single source where the source also only
   * targets this node.
   */
  private redundantBySource(node: Node, flow: FlowData): Link | undefined {
    const incomingLinks = flow.links.filter((l) => l.target === node.id);
    if (incomingLinks.length !== 1) return undefined;
    const link = incomingLinks[0];
    const otherSourceOutgoingLinks = flow.links.filter(
      (l) => l !== link && l.source === link.source,
    );
    if (otherSourceOutgoingLinks.length > 0) return undefined;
    return link;
  }

  /**
   * Determines whether a node has a single target where the target also only
   * sources from this node.
   */
  private redundantByTarget(node: Node, flow: FlowData): Link | undefined {
    const outgoingLinks = flow.links.filter((l) => l.source === node.id);
    if (outgoingLinks.length !== 1) return undefined;
    const link = outgoingLinks[0];
    const otherTargetIncomingLinks = flow.links.filter(
      (l) => l !== link && l.target === link.target,
    );
    if (otherTargetIncomingLinks.length > 0) return undefined;
    return link;
  }
}
