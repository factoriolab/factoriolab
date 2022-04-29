import pkg from 'package.json';

import { Environment } from './';

export const environment: Environment = {
  production: true,
  testing: false,
  debug: false,
  baseHref: '/',
  version: `${pkg.version}`,
};
