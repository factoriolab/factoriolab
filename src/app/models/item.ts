import { Belt } from './belt';
import { CategoryId } from './category';
import { Factory } from './factory';
import { Module } from './module';

export enum ItemId {
  Pipe = 'pipe',
  WoodenChest = 'wooden-chest',
}

export interface Item {
  id: string;
  name: string;
  category: CategoryId;
  row: number;
  stack?: number;
  belt?: Belt;
  factory?: Factory;
  module?: Module;
}
