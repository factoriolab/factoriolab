import { IconJson } from '~/data/schema/icon';
import { toRecord } from '~/utils/record';

export const systemIcons: IconJson[] = [
  {
    id: 'time',
    position: '-66px 0',
    color: '',
  },
  {
    id: 'transparent',
    position: '-132px 0',
    color: '',
  },
  {
    id: 'module',
    position: '-198px 0',
    color: '#ffffff',
  },
  {
    id: 'pipe',
    position: '-264px 0',
    color: '',
  },
  {
    id: 'inserter',
    position: '0 -66px',
    color: '',
  },
  {
    id: 'long-handed-inserter',
    position: '-66px -66px',
    color: '',
  },
  {
    id: 'fast-inserter',
    position: '-132px -66px',
    color: '',
  },
  {
    id: 'bulk-inserter',
    position: '-198px -66px',
    color: '',
  },
  {
    id: 'q-1',
    position: '-264px -66px',
    color: '',
  },
  {
    id: 'q0',
    position: '0 -132px',
    color: '',
  },
  {
    id: 'q1',
    position: '-66px -132px',
    color: '',
  },
  {
    id: 'q2',
    position: '-132px -132px',
    color: '',
  },
  {
    id: 'q3',
    position: '-198px -132px',
    color: '',
  },
  {
    id: 'q5',
    position: '-264px -132px',
    color: '',
  },
  {
    id: 'captain-of-industry',
    position: '0 -198px',
    color: '',
  },
  {
    id: 'dyson-sphere-program',
    position: '-66px -198px',
    color: '',
  },
  {
    id: 'factor-y',
    position: '-132px -198px',
    color: '',
  },
  {
    id: 'factorio',
    position: '-198px -198px',
    color: '',
  },
  {
    id: 'final-factory',
    position: '-264px -198px',
    color: '',
  },
  {
    id: 'foundry',
    position: '0 -264px',
    color: '',
  },
  {
    id: 'mindustry',
    position: '-66px -264px',
    color: '',
  },
  {
    id: 'outworld-station',
    position: '-132px -264px',
    color: '',
  },
  {
    id: 'satisfactory',
    position: '-198px -264px',
    color: '',
  },
  {
    id: 'techtonica',
    position: '-264px -264px',
    color: '',
  },
];

export const systemIconsRecord = toRecord(
  systemIcons.map((i) => ({ ...i, ...{ file: 'url("icons/icons.webp")' } })),
);
