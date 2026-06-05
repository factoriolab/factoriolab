export interface BaseJson {
  id: string;
  name: string;
  /** Used to link the object to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
}
