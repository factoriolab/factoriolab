export interface PrototypeApi {
  application: string;
  application_version: string;
  api_version: number;
  stage: string;
  prototypes: Prototype[];
  types: Concept[];
}

export interface Prototype {
  name: string;
  order: number;
  description: string;
  lists?: string[];
  examples?: string[];
  images?: Image[];
  parent?: string;
  abstract: boolean;
  typename?: string;
  instance_limit?: number;
  deprecated: boolean;
  properties: Property[];
  custom_properties: CustomProperty[];
}

export interface Concept {
  name: string;
  order: number;
  description: string;
  lists?: string[];
  examples?: string[];
  images?: Image[];
  parent?: string;
  abstract: boolean;
  inline: false;
  type: DataType;
  properties?: Property[];
}

export interface Property {
  name: string;
  order: number;
  description: string;
  lists?: string[];
  examples?: string[];
  images?: Image[];
  alt_name?: string;
  override: boolean;
  type: DataType;
  optional: boolean;
  default?: [string, LiteralDataType];
}

export interface ComplexDataType {
  complex_type: string;
}

export interface ArrayDataType extends ComplexDataType {
  complex_type: 'array';
  value: DataType;
}

export interface DictionaryDataType extends ComplexDataType {
  complex_type: 'dictionary';
  key: DataType;
  value: DataType;
}

export interface TupleDataType extends ComplexDataType {
  complex_type: 'tuple';
  values: DataType[];
}

export interface UnionDataType extends ComplexDataType {
  complex_type: 'union';
  options: DataType[];
  full_format: boolean;
}

export interface LiteralDataType extends ComplexDataType {
  complex_type: 'literal';
  value: string | number | boolean;
  description?: string;
}

export interface TypeDataType extends ComplexDataType {
  complex_type: 'type';
  value: DataType;
  description: string;
}

export interface StructDataType extends ComplexDataType {
  complex_type: 'struct';
}

export type DataType =
  | string
  | ArrayDataType
  | DictionaryDataType
  | TupleDataType
  | UnionDataType
  | LiteralDataType
  | TypeDataType
  | StructDataType;

export interface Image {
  filename: string;
  caption?: string;
}

export interface CustomProperty {
  description: string;
  lists?: string[];
  examples?: string[];
  images?: Image[];
  key_type: DataType;
  value_type: DataType;
}
