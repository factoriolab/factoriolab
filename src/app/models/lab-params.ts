export type Params = Partial<Record<string, string | string[]>>;

export interface LabParams {
  /** `object[]` Objectives */
  o?: string[];
  /** `Entities` Item settings */
  i?: string[];
  /** `Entities` Recipe settings */
  r?: string[];
  /** `Entities` Machine settings */
  m?: string[];
  /** `object[]` Module settings */
  e?: string[];
  /** `object[]` Beacon settings */
  b?: string[];
  /** `string` Version */
  v?: string;
  /** `string` Zip */
  z?: string;
  /** `Set` Checked objectives  */
  och?: string;
  /** `number` Maximize type */
  omt?: string;
  /** `boolean` Require machines output */
  orm?: string;
  /** `number` Display rate */
  odr?: string;
  /** `Set` Excluded items */
  iex?: string;
  /** `Set` Checked items */
  ich?: string;
  /** V10 Legacy excluded items */
  v10iex?: string;
  /** V10 Legacy checked items */
  v10ich?: string;
  /** `string` Belt */
  ibe?: string;
  /** `string` Pipe */
  ipi?: string;
  /** `string` Cargo wagon */
  icw?: string;
  /** `string` Fluid wagon */
  ifw?: string;
  /** `Rational` Flow rate */
  ifr?: string;
  /** `Rational` Stack */
  ist?: string;
  /** `Set` Excluded recipes */
  rex?: string;
  /** `Set` Checked recipes */
  rch?: string;
  /** V10 Legacy excluded recipes */
  v10rex?: string;
  /** V10 Legacy checked recipes */
  v10rch?: string;
  /** `boolean` Net production only */
  rnp?: string;
  /** `number` Preset */
  mpr?: string;
  /** `string[]` Machine rank */
  mmr?: string;
  /** `string[]` Fuel rank */
  mfr?: string;
  /** `string[]` Module rank */
  mer?: string;
  /** `number[]` Beacons */
  mbe?: string;
  /** `Rational` Overclock */
  moc?: string;
  /** `number` Inserter target */
  mit?: string;
  /** `Rational` Beacon receivers */
  mbr?: string;
  /** `string` Proliferator spray */
  mps?: string;
  /** `Rational` Mining bonus */
  bmi?: string;
  /** `Rational` Research bonus */
  bre?: string;
  /** `number` Inserter capacity */
  bic?: string;
  /** `Set` Researched technologies */
  tre?: string;
  /** V10 Legacy researched technologies */
  v10tre?: string;
  /** `Set` Locations */
  loc?: string;
  /** `Rational` Cost factor */
  cfa?: string;
  /** `Rational` Cost machine */
  cma?: string;
  /** `Rational` Cost footprint */
  cfp?: string;
  /** `Rational` Cost unproduceable */
  cun?: string;
  /** `Rational` Cost excluded */
  cex?: string;
  /** `Rational` Cost surplus */
  csu?: string;
  /** `Rational` Cost maximize */
  cmx?: string;
  /** `Rational` Cost recycling */
  cre?: string;
}
