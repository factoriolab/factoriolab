import { ModuleEffect } from '~/data/schema/module';
import { Rational, rational } from '~/rational/rational';

export const mockModuleEffects: Record<ModuleEffect, Rational> = {
  consumption: rational.one,
  pollution: rational.one,
  productivity: rational.one,
  quality: rational.zero,
  speed: rational.one,
};
