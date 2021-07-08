export interface Environment {
  production: boolean;
  testing: boolean;
  debug: boolean;
  baseHref: string;
  version: string;
}

export * from './environment';
