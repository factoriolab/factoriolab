export interface CategoryJson {
  id: string;
  name: string;
  /** Used to link the category to an alternate icon id */
  icon?: string;
  /** Used to add extra text to an already defined icon */
  iconText?: string;
}

export type Category = CategoryJson;
