import { Quality } from './quality';

export interface IconJson {
  id: string;
  position: string;
  color: string;
}

export interface Icon extends IconJson {
  file: string;
  text?: string;
  quality?: Quality;
}
