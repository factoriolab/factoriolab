import { version } from 'package.json';
import { Environment } from '.';

export const environment: Environment = {
  production: false,
  testing: true,
  debug: false,
  baseHref: '/',
  version: `${version} (test)`,
};
