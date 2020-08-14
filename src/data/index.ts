import { AppData } from '~/models';
import app from './app/data.json';

export { app };
export const data: AppData = {
  app,
  base: [
    { id: '0.18', name: '0.18.36' },
    { id: '0.17', name: '0.17.79' },
    { id: '0.16', name: '0.16.51' },
    { id: 'krastorio2', name: 'Krastorio 2' },
  ],
  mods: [
    {
      id: 'research',
      name: 'Infinite Research',
      compatibleIds: ['0.18', '0.17', '0.16'],
    },
  ],
};
