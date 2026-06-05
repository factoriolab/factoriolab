export type Rounded = 'all' | 'start' | 'end' | 'none';

export const roundedVariants: Record<Rounded, string | null> = {
  all: 'rounded-xs',
  start: 'rounded-s-xs',
  end: 'rounded-e-xs',
  none: null,
};
