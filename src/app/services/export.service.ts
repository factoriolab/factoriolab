import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

import { notNullish } from '~/helpers';
import {
  Column,
  Dataset,
  Entities,
  ItemSettings,
  Rational,
  RecipeSettings,
  Step,
} from '~/models';
import { ColumnsState } from '~/store/preferences';
import { BrowserUtility, RecipeUtility } from '~/utilities';

const CSV_TYPE = 'text/csv;charset=UTF-8';
const CSV_EXTENSION = '.csv';
const JSON_TYPE = 'text/json;charset=UTF-8';
const JSON_EXTENSION = '.json';

export interface StepExport {
  Item?: string;
  Items?: string;
  Surplus?: string;
  Inputs?: string;
  Outputs?: string;
  Targets?: string;
  Belts?: string;
  Belt?: string;
  Wagons?: string;
  Wagon?: string;
  Recipe?: string;
  Machines?: string;
  Machine?: string;
  MachineModules?: string;
  Beacons?: string;
  Beacon?: string;
  BeaconModules?: string;
  Power?: string;
  Pollution?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  stepsToCsv(
    steps: Step[],
    columns: ColumnsState,
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RecipeSettings>,
    data: Dataset
  ): void {
    const json = steps.map((s) =>
      this.stepToJson(s, steps, columns, itemSettings, recipeSettings, data)
    );
    const fields = Object.keys(json[0]) as (keyof StepExport)[];
    const csv = json.map((row) => fields.map((f) => row[f]).join(','));
    csv.unshift(fields.join(','));
    csv.unshift(`"${BrowserUtility.href}"`);
    this.saveAsCsv(csv.join('\r\n'));
  }

  /* Don't test dependencies (file-saver) */
  /* istanbul ignore next */
  saveAsCsv(data: string): void {
    saveAs(
      new Blob([data], { type: CSV_TYPE }),
      'factoriolab_list' + CSV_EXTENSION
    );
  }

  /* Don't test dependencies (file-saver) */
  /* istanbul ignore next */
  saveAsJson(data: string): void {
    saveAs(
      new Blob([data], { type: JSON_TYPE }),
      'factoriolab_flow' + JSON_EXTENSION
    );
  }

  stepToJson(
    step: Step,
    steps: Step[],
    columns: ColumnsState,
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RecipeSettings>,
    data: Dataset
  ): StepExport {
    const exp: StepExport = {};
    if (step.itemId != null) {
      exp.Item = step.itemId;
      const settings = itemSettings[step.itemId];
      if (step.items != null) {
        exp.Items =
          '=' + step.items.sub(step.surplus ?? Rational.zero).toString();
      }
      if (step.surplus != null) {
        exp.Surplus = '=' + step.surplus.toString();
      }
      if (columns[Column.Belts].show) {
        if (step.belts != null) {
          exp.Belts = '=' + step.belts.toString();
        }
        exp.Belt = settings.beltId;
      }
      if (columns[Column.Wagons].show) {
        if (step.wagons != null) {
          exp.Wagons = '=' + step.wagons.toString();
        }
        exp.Wagon = settings.wagonId;
      }
    }
    if (step.recipeId != null) {
      exp.Recipe = step.recipeId;
      const recipe = data.recipeR[step.recipeId];
      const settings = recipeSettings[step.recipeId];
      const inputs = Object.keys(recipe.in)
        .map((i) => {
          const inStep = steps.find((s) => s.itemId === i);
          return [i, inStep?.parents?.[step.id]?.toString()];
        })
        .filter((v) => v[1])
        .map((v) => `${v[0]}:${v[1]}`)
        .join(',');
      if (inputs) {
        exp.Inputs = `"${inputs}"`;
      }
      if (settings.machineId != null) {
        const machine = data.machineEntities[settings.machineId];
        const allowsModules = RecipeUtility.allowsModules(recipe, machine);
        if (columns[Column.Machines].show) {
          if (step.machines != null) {
            exp.Machines = '=' + step.machines.toString();
          }
          exp.Machine = settings.machineId;
          if (allowsModules && settings.machineModuleIds != null) {
            exp.MachineModules = `"${settings.machineModuleIds.join(',')}"`;
          }
        }
        if (columns[Column.Beacons].show && allowsModules) {
          exp.Beacons = `"${settings.beacons?.map((b) => b.count).join(',')}"`;
          exp.Beacon = `"${settings.beacons?.map((b) => b.id).join(',')}"`;
          exp.BeaconModules = `"${settings.beacons
            ?.map((b) => b.moduleIds?.join('|'))
            .join(',')}"`;
        }
        if (columns[Column.Power].show) {
          if (step.power != null) {
            exp.Power = '=' + step.power.toString();
          }
        }
        if (columns[Column.Pollution].show) {
          if (step.pollution != null) {
            exp.Pollution = '=' + step.pollution.toString();
          }
        }
      }
    }
    if (step.outputs != null) {
      const outputs = step.outputs; // Store as non-null
      const outputsStr = Object.keys(outputs)
        .map((o) => `${o}:${outputs[o].toString()}`)
        .join(',');
      exp.Outputs = `"${outputsStr}"`;
    }
    if (step.parents != null) {
      const parents = step.parents; // Store as non-null
      const parentsStr = Object.keys(parents)
        .map((p) => steps.find((s) => s.id === p))
        .filter(notNullish)
        .map((s) => `${s.recipeId}:${parents[s.id].toString()}`)
        .join(',');
      exp.Targets = `"${parentsStr}"`;
    }
    return exp;
  }
}
