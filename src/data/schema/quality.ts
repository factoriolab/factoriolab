import { BaseJson } from './base';

export interface QualityJson extends BaseJson {
  level: number;
}
export type Quality = QualityJson;

export const QUALITY_REGEX = /^(.*)\((\d)\)$/;

export function baseId(id: string): string {
  const match = QUALITY_REGEX.exec(id);
  if (match) return match[1];
  return id;
}

export function qualityId(id: string, quality: QualityJson): string {
  if (quality.level <= 0) return id;
  return `${id}(${quality.level.toString()})`;
}
