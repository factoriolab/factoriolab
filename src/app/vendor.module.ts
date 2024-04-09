import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { AutoFocusModule } from 'primeng/autofocus';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ConnectedOverlayScrollHandler, DomHandler } from 'primeng/dom';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MenuModule } from 'primeng/menu';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrderList, OrderListModule } from 'primeng/orderlist';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Workaround for https://github.com/primefaces/primeng/issues/12114.
 * Manually add the main window to the list of scrollable parents, so that when
 * the main window is scrolled, dropdowns will be closed.
 */
ConnectedOverlayScrollHandler.prototype.bindScrollListener = function (
  this,
): void {
  this.scrollableParents = DomHandler.getScrollableParents(this.element);
  this.scrollableParents.push(window);
  for (const parent of this.scrollableParents)
    parent.addEventListener('scroll', this.listener);
};

// istanbul ignore next
/** Allow entering spaces inside orderlist items */
OrderList.prototype.onSpaceKey = function (): void {};

const modules = [
  // primeng
  AccordionModule,
  AutoFocusModule,
  BreadcrumbModule,
  ButtonModule,
  CardModule,
  CheckboxModule,
  ConfirmDialogModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  InputNumberModule,
  InputTextareaModule,
  InputTextModule,
  MenuModule,
  MessagesModule,
  MultiSelectModule,
  OrderListModule,
  ProgressSpinnerModule,
  RippleModule,
  ScrollPanelModule,
  SplitButtonModule,
  TableModule,
  TabMenuModule,
  TabViewModule,
  ToastModule,
  ToggleButtonModule,
  TooltipModule,

  // ngx-translate
  TranslateModule,
];

@NgModule({
  imports: [CommonModule, ...modules],
  exports: [...modules],
})
export class VendorModule {}
