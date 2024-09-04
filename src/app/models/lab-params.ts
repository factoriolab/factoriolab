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
  /** `boolean` Surplus machines output */
  osm?: string;
  /** `number` Display rate */
  odr?: string;
  /** `Set` Excluded items */
  iex?: string;
  /** `Set` Checked items */
  ich?: string;
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
  /** `Set` Excluded recipes */
  rex?: string;
  /** `Set` Checked recipes */
  rch?: string;
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
}
