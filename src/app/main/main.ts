import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FileClient } from '~/data/file-client';
import { ObjectivesStore } from '~/state/objectives/objectives-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Aside } from './aside/aside';
import { Header } from './header/header';
import { Objectives } from './objectives/objectives';

@Component({
  selector: 'lab-main',
  imports: [AsyncPipe, RouterOutlet, Aside, Header, Objectives, TranslatePipe],
  templateUrl: './main.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class Main {
  protected readonly fileClient = inject(FileClient);
  private readonly objectivesStore = inject(ObjectivesStore);

  result = this.objectivesStore.matrixResult;
}
