import { Pattern, PatternFactory } from './Pattern';
import { IQueryStrategy, IStepResult } from './QueryStrategy';

export interface IPatternFactoryRegistry {
  get(patternFactoryId: string): PatternFactory;
}

export class Matcher {
  public constructor(
    public patternFactoryRegistry: IPatternFactoryRegistry,
  ) {}
  public *queryPattern(
    sequence: Array<number>,
    queryStrategy: IQueryStrategy,
  ): Iterator<undefined | Pattern> {
    if (sequence.length === 0) {
      return;
    }
    const factoryIterators: Map<string, Iterator<undefined | Pattern>>
      = new Map();
    const stepResult: IStepResult = {
      exhausted: false,
      found: false,
    };
    let queryStrategyIteratorResult = queryStrategy.next();
    while (!queryStrategyIteratorResult.done) {
      const patternFactoryId = queryStrategyIteratorResult.value;
      if (patternFactoryId === undefined) {
        continue;
      }
      let factoryIterator = factoryIterators.get(patternFactoryId);
      if (factoryIterator === undefined) {
        const factory = this.patternFactoryRegistry.get(patternFactoryId);
        factoryIterator = factory.querySequence(this, sequence);
        factoryIterators.set(patternFactoryId, factoryIterator);
      }
      const factoryIteratorResult = factoryIterator.next();
      stepResult.exhausted = factoryIteratorResult.done;
      stepResult.found = factoryIteratorResult.value !== undefined;
      if (stepResult.exhausted) {
        factoryIterators.delete(patternFactoryId);
      }
      // console.info(patternFactoryId, stepResult);
      yield factoryIteratorResult.value;
      queryStrategyIteratorResult
        = queryStrategy.next(stepResult);
    }
  }
}
