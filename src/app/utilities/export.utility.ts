import { saveAs } from 'file-saver';

import { Step, Column, Dataset, Rational } from '~/models';
import { ItemsState } from '~/store/items';
import { ColumnsState } from '~/store/preferences';
import { RecipesState } from '~/store/recipes';
import { BrowserUtility } from './browser.utility';
import { RecipeUtility } from './recipe.utility';

const CSV_TYPE = 'text/csv;charset=UTF-8';
const CSV_EXTENSION = '.csv';

export interface StepExport {
  Item: string;
  Items: string;
  Surplus: string;
  Inputs: string;
  Outputs: string;
  Targets: string;
  Belts?: string;
  Belt?: string;
  Wagons?: string;
  Wagon?: string;
  Recipe?: string;
  Factories?: string;
  Factory?: string;
  FactoryModules?: string;
  Beacons?: string;
  Beacon?: string;
  BeaconModules?: string;
  Power?: string;
  Pollution?: string;
}

export class ExportUtility {
  static stepsToCsv(
    steps: Step[],
    columns: ColumnsState,
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    data: Dataset
  ): void {
    const json = steps.map((s) =>
      this.stepToJson(s, steps, columns, itemSettings, recipeSettings, data)
    );
    const fields = Object.keys(json[0]);
    const csv = json.map((row) => fields.map((f) => row[f]).join(','));
    csv.unshift(fields.join(','));
    csv.unshift(`"${BrowserUtility.href}"`);
    this.saveAsCsv(csv.join('\r\n'));
  }

  /* Don't test dependencies (file-saver) */
  /* istanbul ignore next */
  static saveAsCsv(data: string): void {
    saveAs(
      new Blob([data], { type: CSV_TYPE }),
      'factoriolab_steps' + CSV_EXTENSION
    );
  }

  static stepToJson(
    step: Step,
    steps: Step[],
    columns: ColumnsState,
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    data: Dataset
  ): StepExport {
    const exp: StepExport = {
      Item: step.itemId,
      Items: step.items
        ? '=' + step.items.sub(step.surplus || Rational.zero).toString()
        : '',
      Surplus: step.surplus ? '=' + step.surplus.toString() : '',
      Inputs: '',
      Outputs: step.outputs
        ? `"${Object.keys(step.outputs)
            .map((o) => `${o}:${step.outputs[o].toString()}`)
            .join(',')}"`
        : '',
      Targets: step.parents
        ? `"${Object.keys(step.parents)
            .map((p) => `${p}:${step.parents[p].toString()}`)
            .join(',')}"`
        : '',
    };
    if (columns[Column.Belts].show) {
      exp.Belts = step.belts ? '=' + step.belts.toString() : '';
      exp.Belt = itemSettings[step.itemId].belt;
    }
    if (columns[Column.Wagons].show) {
      exp.Wagons = step.wagons ? '=' + step.wagons.toString() : '';
      exp.Wagon = itemSettings[step.itemId].wagon;
    }
    if (step.recipeId) {
      exp.Recipe = step.recipeId;
      const recipe = data.recipeR[step.recipeId];
      if (recipe.in) {
        exp.Inputs = `"${Object.keys(recipe.in)
          .map((i) => {
            const inStep = steps.find((s) => s.itemId === i);
            return `${i}:${inStep?.parents[step.recipeId].toString() || ''}`;
          })
          .join(',')}"`;
      }
      const settings = recipeSettings[step.recipeId];
      const factory = data.itemEntities[settings.factory].factory;
      const allowsModules = RecipeUtility.allowsModules(recipe, factory);
      if (columns[Column.Factories].show) {
        exp.Factories = step.factories ? '=' + step.factories.toString() : '';
        exp.Factory = settings.factory;
        if (allowsModules) {
          exp.FactoryModules = `"${settings.factoryModules.join(',')}"`;
        }
      }
      if (columns[Column.Beacons].show && allowsModules) {
        exp.Beacons = settings.beaconCount;
        exp.Beacon = settings.beacon;
        exp.BeaconModules = `"${settings.beaconModules.join(',')}"`;
      }
      if (columns[Column.Power].show) {
        exp.Power = step.power ? '=' + step.power.toString() : '';
      }
      if (columns[Column.Pollution].show) {
        exp.Pollution = step.pollution ? '=' + step.pollution.toString() : '';
      }
    }
    return exp;
  }
}
