import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faFilePen,
  faHandHoldingDollar,
} from '@fortawesome/free-solid-svg-icons';

interface Link {
  text: string;
  icon: IconDefinition;
  href: string;
}

export const headerLinks: Link[] = [
  {
    text: 'header.discord',
    icon: faDiscord,
    href: 'https://discord.gg/N4FKV687x2',
  },
  {
    text: 'header.sponsor',
    icon: faHandHoldingDollar,
    href: 'https://ko-fi.com/dcbroad3',
  },
  {
    text: 'header.source',
    icon: faGithub,
    href: 'https://github.com/factoriolab/factoriolab',
  },
  {
    text: 'header.editor',
    icon: faFilePen,
    href: '/editor',
  },
];
