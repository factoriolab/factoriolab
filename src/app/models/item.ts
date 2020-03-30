export interface Item {
  id: string;
  name: string;
  category: string;
  row: number;
  stack?: number;
  belt?: Belt;
  factory?: Factory;
  module?: Module;
}

export interface Belt {
  speed: number;
}

export interface Factory {
  speed: number;
  modules: number;
  burner?: number;
  electric?: number;
  drain?: number;
}

export interface Module {
  speed: number;
  productivity: number;
  energy: number;
}
