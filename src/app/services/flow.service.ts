import { inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, switchMap } from 'rxjs';

import { MIN_LINK_VALUE } from '~/models/constants';
import { Icon } from '~/models/data/icon';
import { AdjustedDataset } from '~/models/dataset';
import { LinkValue } from '~/models/enum/link-value';
import { FlowData } from '~/models/flow';
import { Rational, rational } from '~/models/rational';
import { ColumnsState } from '~/models/settings/column-settings';
import { Settings } from '~/models/settings/settings';
import { Step } from '~/models/step';
import { Entities } from '~/models/utils';

import { ObjectivesService } from '../store/objectives.service';
import {
  PreferencesService,
  PreferencesState,
} from '../store/preferences.service';
import { RecipesService } from '../store/recipes.service';
import { SettingsService } from '../store/settings.service';
import { ThemeService, ThemeValues } from './theme.service';
import { TranslateService } from './translate.service';

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  objectivesSvc = inject(ObjectivesService);
  preferencesSvc = inject(PreferencesService);
  recipesSvc = inject(RecipesService);
  settingsSvc = inject(SettingsService);
  themeSvc = inject(ThemeService);
  translateSvc = inject(TranslateService);

  flowData$ = combineLatest({
    steps: toObservable(this.objectivesSvc.steps),
    suffix: toObservable(this.settingsSvc.displayRateInfo).pipe(
      switchMap((dr) => this.translateSvc.get(dr.suffix)),
    ),
    settings: toObservable(this.settingsSvc.settings),
    preferences: toObservable(this.preferencesSvc.state),
    data: toObservable(this.recipesSvc.adjustedDataset),
    themeValues: this.themeSvc.themeValues$,
  }).pipe(
    map(({ steps, suffix, settings, preferences, data, themeValues }) =>
      this.buildGraph(steps, suffix, settings, preferences, data, themeValues),
    ),
  );

  recipeStepNodeType(step: Step): string {
    return step.recipeObjectiveId ? 'm' : 'r';
  }

  buildGraph(
    steps: Step[],
    suffix: string,
    settings: Settings,
    preferences: PreferencesState,
    data: AdjustedDataset,
    themeValues: ThemeValues,
  ): FlowData {
    const itemPrec = preferences.columns.items.precision;
    const machinePrec = preferences.columns.machines.precision;
    const flow: FlowData = {
      nodes: [],
      links: [],
    };

    const stepItemMap: Entities<Step> = {};
    const stepValue: Entities<Rational> = {};
    const stepText: Entities<Rational> = {};
    const stepMap = steps.reduce((e: Entities<Step>, s) => {
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
        const item = data.itemEntities[step.itemId];
        const icon = data.iconEntities[item.icon ?? item.id];
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
            color: themeValues.dangerBackground,
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
            color: themeValues.successBackground,
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
        const recipe = data.recipeEntities[step.recipeId];
        const machine = data.itemEntities[step.recipeSettings?.machineId];
        const icon = data.iconEntities[recipe.icon ?? recipe.id];
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
            const item = data.itemEntities[itemId];
            const icon = data.iconEntities[item.icon ?? item.id];
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

  positionProps(icon: Icon): { posX: string; posY: string; viewBox: string } {
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
