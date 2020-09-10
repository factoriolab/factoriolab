import { saveAs } from 'file-saver';

import { Step, Column, toBoolEntities, Entities } from '~/models';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';

const CSV_TYPE = 'text/csv;charset=UTF-8';
const CSV_EXTENSION = '.csv';

export interface StepExport {
  Item: string;
  Items: number;
  Surplus: number;
  Belts?: number;
  Belt?: string;
  Wagons?: number;
  Wagon?: string;
  Recipe?: string;
  Factories?: number;
  Factory?: string;
  FactoryModules?: string;
  Beacons?: number;
  Beacon?: string;
  BeaconModules?: string;
  Power?: number;
  Pollution?: number;
}

export class ExportUtility {
  static stepsToCsv(
    steps: Step[],
    columns: Column[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState
  ) {
    const json = this.stepsToJson(steps, columns, itemSettings, recipeSettings);
    const fields = Object.keys(json[0]);
    const csv = json.map((row) => fields.map((f) => row[f]).join(','));
    csv.unshift(fields.join(','));
    csv.unshift(`"${location.href}"`);
    this.saveAsCsv(csv.join('\r\n'));
  }

  /* Don't test dependencies (file-saver) */
  /* istanbul ignore next */
  static saveAsCsv(data: string) {
    saveAs(
      new Blob([data], { type: CSV_TYPE }),
      'factoriolab_steps' + CSV_EXTENSION
    );
  }

  static stepsToJson(
    steps: Step[],
    columns: Column[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState
  ) {
    const map = toBoolEntities(columns);
    return steps.map((s) =>
      this.stepToJson(s, map, itemSettings, recipeSettings)
    );
  }

  static stepToJson(
    step: Step,
    columns: Entities<boolean>,
    itemSettings: ItemsState,
    recipeSettings: RecipesState
  ) {
    const exp: StepExport = {
      Item: step.itemId,
      Items: step.items.toNumber(),
      Surplus: step.surplus?.toNumber() || 0,
    };
    if (columns[Column.Belts]) {
      exp.Belts = step.belts?.toNumber() || 0;
      exp.Belt = itemSettings[step.itemId].belt;
    }
    if (columns[Column.Wagons]) {
      exp.Wagons = step.wagons?.toNumber() || 0;
      exp.Wagon = itemSettings[step.itemId].wagon;
    }
    if (step.recipeId) {
      exp.Recipe = step.recipeId;
      const recipe = recipeSettings[step.recipeId];
      if (columns[Column.Factories]) {
        exp.Factories = step.factories?.toNumber() || 0;
        exp.Factory = recipe.factory;
        exp.FactoryModules = `"${(recipe.factoryModules || []).join(',')}"`;
      }
      if (columns[Column.Beacons]) {
        exp.Beacons = recipe.beaconCount;
        exp.Beacon = recipe.beacon;
        exp.BeaconModules = `"${(recipe.beaconModules || []).join(',')}"`;
      }
      if (columns[Column.Power]) {
        exp.Power = step.power?.toNumber() || 0;
      }
      if (columns[Column.Pollution]) {
        exp.Pollution = step.pollution?.toNumber() || 0;
      }
    } else {
      exp.Recipe = '';
      if (columns[Column.Factories]) {
        exp.Factories = 0;
        exp.Factory = '';
        exp.FactoryModules = '';
      }
      if (columns[Column.Beacons]) {
        exp.Beacons = 0;
        exp.Beacon = '';
        exp.BeaconModules = '';
      }
      if (columns[Column.Power]) {
        exp.Power = 0;
      }
      if (columns[Column.Pollution]) {
        exp.Pollution = 0;
      }
    }
    return exp;
  }
}
