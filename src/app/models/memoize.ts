import * as memoizee from 'memoizee';

type Resolver = (...args: any[]) => any;

export function memoize(resolver?: Resolver) {
  return (
    target: any,
    key: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor => {
    descriptor.value = memoizee(descriptor.value, resolver);
    return descriptor;
  };
}
