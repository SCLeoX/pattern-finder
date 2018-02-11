import { LinkedList } from './LinkedList';

export interface IQueryStrategy extends Iterator<string | undefined> {}
export interface IStepResult {
  exhausted: boolean;
  found: boolean;
}

/**
 * PFI = PatternFactoryIds
 */
const basicStrategyPFIList = [
  'Diff',
  'ConstantAddBi',
  'Geometric',
  'ConstantMultiplyBi',
  'Fib',
  'Alt',
];

/**
 * Used to create query strategies. (Simple factory pattern)
 */
export abstract class QueryStrategyFactory {
  public static *createBasicStrategy(blacklist?: Set<string>): IQueryStrategy {
    if (blacklist === undefined || !blacklist.has('Constant')) {
      // If Constant matches, we don't need to do anything else.
      const stepResult: IStepResult = yield 'Constant';
      if (stepResult.found) {
        return;
      }
    }
    const list = new LinkedList<string>();
    for (const pfi of basicStrategyPFIList) {
      if (blacklist !== undefined && blacklist.has(pfi)) {
        continue;
      }
      list.append(pfi);
    }
    if (list.length === 0) {
      return;
    }
    while (list.length > 0) {
      const iterator = list.iterate();
      let iteratorResult = iterator.next();
      while (!iteratorResult.done) {
        const pfi = iteratorResult.value;
        const stepResult: IStepResult = yield pfi;
        iteratorResult = iterator.next(stepResult.exhausted ? null : undefined);
      }
    }
  }
}
