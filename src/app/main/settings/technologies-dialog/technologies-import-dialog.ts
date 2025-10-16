import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faCheck,
  faCopy,
  faLink,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { WindowClient } from '~/window/window-client';

@Component({
  selector: 'lab-technologies-import-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './technologies-import-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col p-3 sm:p-6 pt-px gap-3 sm:pt-px sm:gap-6 overflow-hidden max-w-full',
  },
})
export class TechnologiesImportDialog implements DialogData {
  readonly header = 'technologies.importHeader';

  protected readonly dialogRef = inject<DialogRef<string[]>>(DialogRef);
  protected readonly settingsStore = inject(SettingsStore);
  private readonly windowClient = inject(WindowClient);

  protected copyText = signal('technologies.exportCopyScript');
  protected value = signal('');

  protected readonly faCheck = faCheck;
  protected readonly faCopy = faCopy;
  protected readonly faLink = faLink;
  protected readonly faXmark = faXmark;

  async copyScript(): Promise<void> {
    await this.windowClient.copyToClipboard(`/c local list = {}
for _, tech in pairs(game.player.force.technologies) do
    if tech.researched or tech.level > tech.prototype.level then
        list[#list + 1] = tech.name
    end
end
helpers.write_file("techs.txt", table.concat(list, ","))
`);
    this.copyText.set('technologies.exportScriptCopied');
  }

  save(): void {
    const data = this.settingsStore.dataset();
    const selection = this.value()
      .split(',')
      .map((v) => v.trim())
      .map((id) => {
        if (!id) return '';

        const alt = `${id}-technology`;
        if (data.technologyIds.includes(alt)) return alt;
        else if (data.technologyIds.includes(id)) return id;
        return '';
      })
      .filter((v) => !!v);

    this.dialogRef.close(selection);
  }
}
