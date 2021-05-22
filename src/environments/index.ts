export interface Environment {
  production: boolean;
  testing: boolean;
  debug: boolean;
  baseHref: string;
}

export * from './environment';
