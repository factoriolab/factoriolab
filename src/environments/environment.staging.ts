import pkg from 'package.json';

import { Environment } from './';

export const environment: Environment = {
  production: true,
  testing: false,
  debug: false,
  baseHref: '/staging/',
  version: `${pkg.version} (staging)`,
};
