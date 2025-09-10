import { CdkCellDef } from '@angular/cdk/table';
import { Directive, input } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[cdkCellDef]',
  providers: [{ provide: CdkCellDef, useExisting: TypeSafeCdkCellDef }],
})
export class TypeSafeCdkCellDef<T> extends CdkCellDef {
  cdkCellDefType = input<T>();

  static ngTemplateContextGuard<T>(
    _: TypeSafeCdkCellDef<T>,
    ctx: unknown,
  ): ctx is { $implicit: T; index: number } {
    return true;
  }
}
