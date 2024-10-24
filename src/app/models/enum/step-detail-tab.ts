export enum StepDetailTab {
  None = 'none',
  Item = 'item',
  Recipe = 'recipe',
  Machine = 'machine',
}

export const stepDetailIcon: Record<StepDetailTab, string> = {
  [StepDetailTab.None]: '',
  [StepDetailTab.Item]: 'fa-solid fa-box',
  [StepDetailTab.Recipe]: 'fa-solid fa-flask',
  [StepDetailTab.Machine]: 'fa-solid fa-industry',
};
