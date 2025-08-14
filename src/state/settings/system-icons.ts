import { IconJson } from '~/models/data/icon';
import { toRecord } from '~/utils/record';

export const systemIcons: IconJson[] = [
  {
    id: 'time',
    position: '-33px 0',
    color: '',
  },
  {
    id: 'transparent',
    position: '-66px 0',
    color: '',
  },
  {
    id: 'module',
    position: '-99px 0',
    color: '#ffffff',
  },
  {
    id: 'pipe',
    position: '-132px 0',
    color: '',
  },
  {
    id: 'inserter',
    position: '0 -33px',
    color: '',
  },
  {
    id: 'long-handed-inserter',
    position: '-33px -33px',
    color: '',
  },
  {
    id: 'fast-inserter',
    position: '-66px -33px',
    color: '',
  },
  {
    id: 'bulk-inserter',
    position: '-99px -33px',
    color: '',
  },
  {
    id: 'q-1',
    position: '-132px -33px',
    color: '',
  },
  {
    id: 'q0',
    position: '0 -66px',
    color: '',
  },
  {
    id: 'q1',
    position: '-33px -66px',
    color: '',
  },
  {
    id: 'q2',
    position: '-66px -66px',
    color: '',
  },
  {
    id: 'q3',
    position: '-99px -66px',
    color: '',
  },
  {
    id: 'q5',
    position: '-132px -66px',
    color: '',
  },
  {
    id: 'captain-of-industry',
    position: '0 -99px',
    color: '',
  },
  {
    id: 'dyson-sphere-program',
    position: '-33px -99px',
    color: '',
  },
  {
    id: 'factor-y',
    position: '-66px -99px',
    color: '',
  },
  {
    id: 'factorio',
    position: '-99px -99px',
    color: '',
  },
  {
    id: 'final-factory',
    position: '-132px -99px',
    color: '',
  },
  {
    id: 'foundry',
    position: '0 -132px',
    color: '',
  },
  {
    id: 'mindustry',
    position: '-33px -132px',
    color: '',
  },
  {
    id: 'outworld-station',
    position: '-66px -132px',
    color: '',
  },
  {
    id: 'satisfactory',
    position: '-99px -132px',
    color: '',
  },
  {
    id: 'techtonica',
    position: '-132px -132px',
    color: '',
  },
];

export const systemIconsRecord = toRecord(
  systemIcons.map((i) => ({ ...i, ...{ file: 'url("icons/icons.webp")' } })),
);
