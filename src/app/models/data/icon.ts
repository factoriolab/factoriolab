export interface IconJson {
  id: string;
  position: string;
  color: string;
  /** If true, icon is mostly white, and should be inverted in light mode */
  invertLight?: boolean;
}

export type Icon = IconJson;
