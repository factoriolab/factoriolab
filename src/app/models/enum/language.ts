import { SelectItem } from 'primeng/api';

export enum Language {
  English = 'en',
  Chinese = 'zh',
}

export const languageOptions: SelectItem<Language>[] = [
  { label: 'English', value: Language.English },
  { label: '简体中文', value: Language.Chinese },
];
