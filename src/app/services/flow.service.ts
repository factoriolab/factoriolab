import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, switchMap } from 'rxjs';

import {
  ColumnsState,
  Dataset,
  Entities,
  FlowData,
  Icon,
  LinkValue,
  MIN_LINK_VALUE,
  Rational,
  Step,
} from '~/models';
import {
  Items,
  LabState,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';

@Injectable({
  providedIn: 'root',
})
export class FlowService {
  translateSvc = inject(TranslateService);
  store = inject(Store<LabState>);

  flowData$ = combineLatest({
    steps: this.store.select(Objectives.getSteps),
    suffix: this.store
      .select(Settings.getDisplayRateInfo)
      .pipe(switchMap((dr) => this.translateSvc.get(dr.suffix))),
    itemsState: this.store.select(Items.getItemsState),
    preferences: this.store.select(Preferences.preferencesState),
    data: this.store.select(Recipes.getAdjustedDataset),
  }).pipe(
    map(({ steps, suffix, itemsState, preferences, data }) =>
      this.buildGraph(steps, suffix, itemsState, preferences, data),
    ),
  );

  recipeStepNodeType(step: Step): string {
    return step.recipeObjectiveId ? 'm' : 'r';
  }

  buildGraph(
    steps: Step[],
    suffix: string,
    itemsState: Items.ItemsState,
    preferences: Preferences.PreferencesState,
    data: Dataset,
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
      stepValue[s.id] = this.stepLinkValue(s, preferences.linkSize);
      stepText[s.id] =
        preferences.linkText === preferences.linkSize
          ? stepValue[s.id]
          : this.stepLinkValue(s, preferences.linkText);
      return e;
    }, {});

    for (const step of steps) {
      if (
        step.itemId &&
        step.items &&
        (!preferences.flowHideExcluded || !itemsState[step.itemId].excluded)
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
          viewBox: this.viewBox(icon),
          href: icon.file,
        });

        if (step.parents) {
          for (const stepId of Object.keys(step.parents)) {
            if (stepId === '') continue; // Ignore outputs

            const parent = stepMap[stepId];
            flow.links.push({
              source: id,
              target: `${this.recipeStepNodeType(parent)}|${parent.recipeId}`,
              name: item.name,
              text: this.linkText(
                stepText[step.id],
                step.parents[stepId],
                preferences.linkText,
                preferences.columns,
                suffix,
              ),
              color: icon.color,
              value: this.linkSize(
                stepValue[step.id],
                step.parents[stepId],
                preferences.linkSize,
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
            color: icon.color,
            stepId: step.id,
            viewBox: this.viewBox(icon),
            href: icon.file,
          });
          flow.links.push({
            source: id,
            target: surplusId,
            name: item.name,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.linkText,
              preferences.columns,
              suffix,
            ),
            color: icon.color,
            value: this.linkSize(
              stepValue[step.id],
              percent,
              preferences.linkSize,
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
            color: icon.color,
            stepId: step.id,
            viewBox: this.viewBox(icon),
            href: icon.file,
          });
          flow.links.push({
            source: id,
            target: outputId,
            name: item.name,
            text: this.linkText(
              stepText[step.id],
              percent,
              preferences.linkText,
              preferences.columns,
              suffix,
            ),
            color: icon.color,
            value: this.linkSize(
              stepValue[step.id],
              percent,
              preferences.linkSize,
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
          viewBox: this.viewBox(icon),
          href: icon.file,
          recipe,
        });

        if (step.outputs) {
          for (const itemId of Object.keys(step.outputs).filter(
            (i) => !preferences.flowHideExcluded || !itemsState[i].excluded,
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
                preferences.linkText,
                preferences.columns,
                suffix,
              ),
              color: icon.color,
              value: this.linkSize(
                stepValue[itemStep.id],
                step.outputs[itemId],
                preferences.linkSize,
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
      return Rational.one;

    switch (prop) {
      case LinkValue.Belts:
        return step.belts ?? Rational.zero;
      case LinkValue.Wagons:
        return step.wagons ?? Rational.zero;
      case LinkValue.Machines:
        return step.machines ?? Rational.zero;
      default:
        return step.items ?? Rational.zero;
    }
  }

  viewBox(icon: Icon): string {
    return `${icon.position.replace(/px/g, '').replace(/-/g, '')} 64 64`;
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
      value = value.div(Rational.ten);

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
        return `${Math.round(percent.mul(Rational.hundred).toNumber())}%`;
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
