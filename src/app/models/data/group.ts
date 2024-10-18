export interface GroupJson {
  id: string;
  name: string;
  /** Used to link the group to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
}

export type Group = GroupJson;
