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
  Rockets?: string;
  Recipe?: string;
  Machines?: string;
  Machine?: string;
  Modules?: string;
  Beacons?: string;
  Power?: string;
  Pollution?: string;
}

export const StepKeys = [
  'Item',
  'Items',
  'Surplus',
  'Inputs',
  'Outputs',
  'Targets',
  'Belts',
  'Belt',
  'Wagons',
  'Wagon',
  'Rockets',
  'Recipe',
  'Machines',
  'Machine',
  'Modules',
  'Beacons',
  'Power',
  'Pollution',
] as (keyof StepExport)[];
