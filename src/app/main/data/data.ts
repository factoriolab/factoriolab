import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { Breadcrumb } from '~/components/breadcrumb/breadcrumb';
import { Icon } from '~/components/icon/icon';
import { IconType } from '~/data/icon-type';
import { LinkOption } from '~/option/link-option';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

type CollectionKey =
  | 'categoryIds'
  | 'itemIds'
  | 'beaconIds'
  | 'beltIds'
  | 'cargoWagonIds'
  | 'fluidWagonIds'
  | 'fuelIds'
  | 'machineIds'
  | 'moduleIds'
  | 'pipeIds'
  | 'technologyIds'
  | 'recipeIds'
  | 'locationIds';

interface CollectionOption extends LinkOption {
  key: CollectionKey;
  iconType: IconType;
}

@Component({
  selector: 'lab-data',
  imports: [RouterLink, Breadcrumb, Icon, TranslatePipe],
  templateUrl: './data.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Data {
  protected readonly settingsStore = inject(SettingsStore);
  protected readonly collections: CollectionOption[] = [
    {
      faIcon: faXmark,
      label: 'data.categories',
      routerLink: 'categories',
      key: 'categoryIds',
      iconType: 'category',
    },
    {
      faIcon: faXmark,
      label: 'data.items',
      routerLink: 'items',
      key: 'itemIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.beacons',
      routerLink: 'beacons',
      key: 'beaconIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.belts',
      routerLink: 'belts',
      key: 'beltIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.cargoWagons',
      routerLink: 'cargo-wagons',
      key: 'cargoWagonIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.fluidWagons',
      routerLink: 'fluid-wagons',
      key: 'fluidWagonIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.fuels',
      routerLink: 'fuels',
      key: 'fuelIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.machines',
      routerLink: 'machines',
      key: 'machineIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.modules',
      routerLink: 'modules',
      key: 'moduleIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.pipes',
      routerLink: 'pipes',
      key: 'pipeIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.technologies',
      routerLink: 'technologies',
      key: 'technologyIds',
      iconType: 'item',
    },
    {
      faIcon: faXmark,
      label: 'data.recipes',
      routerLink: 'recipes',
      key: 'recipeIds',
      iconType: 'recipe',
    },
    {
      faIcon: faXmark,
      label: 'data.locations',
      routerLink: 'locations',
      key: 'locationIds',
      iconType: 'location',
    },
  ];
}
