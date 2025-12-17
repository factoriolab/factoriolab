import { Rational, rational } from '~/rational/rational';

import { Quality } from './quality';

export interface TechnologyJson {
  prerequisites?: string[];

  /** Belt stack size bonus */
  beltStack?: number;
  /** TODO Inserter stack size bonuses */
  inserterStack?: { value: number; category?: string }[];
  /** Mining productivity bonus (%) */
  miningProductivity?: number;
  /** Qualities unlocked */
  qualityUnlock?: Quality[];
  /** Recipe productivity bonuses (%) */
  recipeProductivity?: { id: string; value: number }[];
  /** Recipes unlocked */
  recipeUnlock?: string[];
  /** Research productivity bonus (%) */
  researchProductivity?: number;
  /** Research speed bonus (%) */
  researchSpeed?: number;
}

export interface Technology {
  prerequisites?: string[];

  /** Belt stack size bonus */
  beltStack?: Rational;
  /** Inserter stack size bonuses */
  inserterStack?: { value: Rational; category?: string }[];
  /** Mining productivity bonus (%) */
  miningProductivity?: Rational;
  /** Qualities unlocked */
  qualityUnlock?: Quality[];
  /** Recipe productivity bonuses (%) */
  recipeProductivity?: { id: string; value: Rational }[];
  /** Recipes unlocked */
  recipeUnlock?: string[];
  /** Research productivity bonus (%) */
  researchProductivity?: Rational;
  /** Research speed bonus (%) */
  researchSpeed?: Rational;
}

export function parseTechnology(json: TechnologyJson): Technology;
export function parseTechnology(
  json: TechnologyJson | undefined,
): Technology | undefined;
export function parseTechnology(
  json: TechnologyJson | undefined,
): Technology | undefined {
  if (json == null) return;
  return {
    prerequisites: json.prerequisites,
    beltStack: rational(json.beltStack),
    inserterStack: json.inserterStack
      ? json.inserterStack.map((eff) => ({
          value: rational(eff.value),
          category: eff.category,
        }))
      : undefined,
    miningProductivity: rational(json.miningProductivity),
    qualityUnlock: json.qualityUnlock,
    recipeProductivity: json.recipeProductivity
      ? json.recipeProductivity.map((eff) => ({
          id: eff.id,
          value: rational(eff.value),
        }))
      : undefined,
    recipeUnlock: json.recipeUnlock,
    researchProductivity: rational(json.researchProductivity),
    researchSpeed: rational(json.researchSpeed),
  };
}
