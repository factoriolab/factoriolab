import { NgModule } from '@angular/core';

import { Accordion } from './accordion';
import { AccordionItem } from './accordion-item';

@NgModule({
  imports: [Accordion, AccordionItem],
  exports: [Accordion, AccordionItem],
})
export class AccordionModule {}
