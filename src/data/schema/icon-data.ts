import { Category } from './category';
import { Item } from './item';
import { Quality } from './quality';
import { Recipe } from './recipe';

export interface IconJson {
  id: string;
  x: number;
  y: number;
}

export interface IconBase extends IconJson {
  position: string;
  viewBox: string;
}

export interface IconData extends IconBase {
  file: string;
  image: string;
  text?: string;
  quality?: Quality;
}

export function parseIcon(json: IconJson): IconBase {
  return {
    id: json.id,
    x: json.x,
    y: json.y,
    position: `-${json.x}px -${json.y}px`,
    viewBox: `${json.x} ${json.y} 64 64`,
  };
}

export function parseIconData(
  icon: IconBase,
  file: string,
  entity?: Category | Item | Recipe | IconBase,
): IconData {
  return {
    id: icon.id,
    x: icon.x,
    y: icon.y,
    position: icon.position,
    viewBox: icon.viewBox,
    file,
    image: `url("${file}")`,
    text: (entity as Category | Item | Recipe)?.iconText,
    quality: (entity as Item | Recipe)?.quality,
  };
}
