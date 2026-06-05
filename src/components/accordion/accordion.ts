import { CDK_ACCORDION, CdkAccordion } from '@angular/cdk/accordion';
import { Directive } from '@angular/core';

@Directive({
  selector: 'lab-accordion, [labAccordion]',
  exportAs: 'labAccordion',
  providers: [{ provide: CDK_ACCORDION, useExisting: Accordion }],
})
export class Accordion extends CdkAccordion {}
