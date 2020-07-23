import { AppData } from '~/models';
import app from './app/data.json';
import base017 from './0.17/data.json';
import base018 from './0.18/data.json';
import research from './Research/data.json';

export const data: AppData = {
  app,
  base: [base018, base017],
  mods: [research],
};
