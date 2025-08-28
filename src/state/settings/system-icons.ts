import { IconJson } from '~/models/data/icon';
import { toRecord } from '~/utils/record';

export const systemIcons: IconJson[] = [
  {
    id: 'time',
    position: '-65px 0',
    color: '',
  },
  {
    id: 'transparent',
    position: '-130px 0',
    color: '',
  },
  {
    id: 'module',
    position: '-195px 0',
    color: '#ffffff',
  },
  {
    id: 'pipe',
    position: '-260px 0',
    color: '',
  },
  {
    id: 'inserter',
    position: '0 -65px',
    color: '',
  },
  {
    id: 'long-handed-inserter',
    position: '-65px -65px',
    color: '',
  },
  {
    id: 'fast-inserter',
    position: '-130px -65px',
    color: '',
  },
  {
    id: 'bulk-inserter',
    position: '-195px -65px',
    color: '',
  },
  {
    id: 'q-1',
    position: '-260px -65px',
    color: '',
  },
  {
    id: 'q0',
    position: '0 -130px',
    color: '',
  },
  {
    id: 'q1',
    position: '-65px -130px',
    color: '',
  },
  {
    id: 'q2',
    position: '-130px -130px',
    color: '',
  },
  {
    id: 'q3',
    position: '-195px -130px',
    color: '',
  },
  {
    id: 'q5',
    position: '-260px -130px',
    color: '',
  },
  {
    id: 'captain-of-industry',
    position: '0 -195px',
    color: '',
  },
  {
    id: 'dyson-sphere-program',
    position: '-65px -195px',
    color: '',
  },
  {
    id: 'factor-y',
    position: '-130px -195px',
    color: '',
  },
  {
    id: 'factorio',
    position: '-195px -195px',
    color: '',
  },
  {
    id: 'final-factory',
    position: '-260px -195px',
    color: '',
  },
  {
    id: 'foundry',
    position: '0 -260px',
    color: '',
  },
  {
    id: 'mindustry',
    position: '-65px -260px',
    color: '',
  },
  {
    id: 'outworld-station',
    position: '-130px -260px',
    color: '',
  },
  {
    id: 'satisfactory',
    position: '-195px -260px',
    color: '',
  },
  {
    id: 'techtonica',
    position: '-260px -260px',
    color: '',
  },
];

export const systemIconsRecord = toRecord(
  systemIcons.map((i) => ({ ...i, ...{ file: 'url("icons/icons.webp")' } })),
);
