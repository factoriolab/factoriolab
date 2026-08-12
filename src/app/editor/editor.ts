import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { faCodeCommit, faFlag } from '@fortawesome/free-solid-svg-icons';

import { TabData } from '~/components/tabs/tab-data';
import { Tabs } from '~/components/tabs/tabs';
import { ModData } from '~/data/schema/mod-data';

@Component({
  selector: 'lab-editor',
  imports: [RouterOutlet, Tabs],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-1 sm:px-3 lg:px-6 lg:pt-3 flex grow flex-col' },
})
export class Editor {
  protected readonly tabs: TabData[] = [
    {
      label: 'version',
      value: 'version',
      routerLink: 'version',
      faIcon: faCodeCommit,
    },
    { label: 'flags', value: 'flags', routerLink: 'flags', faIcon: faFlag },
  ];
  protected readonly data: ModData = {
    version: {},
    categories: [],
    icons: [],
    items: [],
    recipes: [],
    flags: [],
  };
}
