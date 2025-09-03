import { Quality } from './quality';

export interface IconJson {
  id: string;
  position: string;
  color: string;
}

export interface IconData extends IconJson {
  file: string;
  text?: string;
  quality?: Quality;
}
