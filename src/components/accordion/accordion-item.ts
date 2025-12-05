import { CdkAccordionItem } from '@angular/cdk/accordion';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { TranslatePipe } from '~/translate/translate-pipe';

let nextUniqueId = 0;

@Component({
  selector: 'lab-accordion-item',
  imports: [NgTemplateOutlet, FaIconComponent, TranslatePipe],
  templateUrl: './accordion-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class AccordionItem extends CdkAccordionItem {
  private uniqueId = (nextUniqueId++).toString();
  protected readonly content = contentChild.required(TemplateRef);

  readonly controlId = input(`lab-accordion-item-${this.uniqueId}`);
  readonly text = input.required<string>();
  readonly note = input<string>();

  protected readonly faChevronRight = faChevronRight;
}
