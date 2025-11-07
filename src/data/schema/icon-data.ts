import { Quality } from './quality';

export interface IconJson {
  id: string;
  position: string;
  color: string;
}

export interface IconData extends IconJson {
  file: string;
  image: string;
  viewBox: string;
  text?: string;
  quality?: Quality;
}

export function getViewBox(position: string): string {
  return `${position.replace(/px/g, '').replace(/-/g, '')} 64 64`;
}
