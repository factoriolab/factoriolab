export interface Icon {
  id: string;
  position: string;
  color: string;
  file?: string;
  /** If true, icon is mostly white, and should be inverted in light mode */
  invertLight?: boolean;
}
