import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faBox, faFlask, faIndustry } from '@fortawesome/free-solid-svg-icons';

export type StepDetailTab = 'item' | 'recipe' | 'machine';

export const stepDetailIcon: Record<StepDetailTab, IconDefinition> = {
  item: faBox,
  recipe: faFlask,
  machine: faIndustry,
};
