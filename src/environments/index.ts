export interface Environment {
  production: boolean;
  debug: boolean;
  baseHref: string;
  name?: string;
}

export * from './environment';
