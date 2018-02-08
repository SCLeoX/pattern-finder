import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';
import { QueryStrategyFactory } from '../QueryStrategy';
import { ConstantPattern } from './ConstantPattern';

export class GeometricPattern extends Pattern {
  public static cacheMap: Map<string, Array<number>> = new Map();
  public cache: Array<number>;
  public constructor(
    public factorPattern: Pattern,
  ) {
    super();
    const identifier = factorPattern.toString(false);
    let cache = GeometricPattern.cacheMap.get(identifier);
    if (cache === undefined) {
      GeometricPattern.cacheMap.set(identifier, cache = [factorPattern.get(1)]);
    }
    this.cache = cache;
  }
  public toString(parentheses: boolean): string {
    return `Geometric(${this.factorPattern.toString(false)})`;
  }
  public get(index: number): number {
    if (index === 0) {
      return 1;
    }
    if (this.cache.length < index) {
      let factorPatternReadAt = this.cache.length;
      for (let i = this.cache.length; i < index; i++) {
        this.cache[i]
          = this.cache[i - 1] * this.factorPattern.get(factorPatternReadAt);
        factorPatternReadAt++;
      }
    }
    return this.cache[index - 1];
  }
}

export class GeometricPatternFactory extends PatternFactory {
  public identifier: string = 'Geometric';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    if (sequence[0] !== 1) {
      return;
    }
    const factorSequence: Array<number> = [];
    let lastValue: number = 1;
    for (let i = 1; i < sequence.length; i++) {
      if (lastValue === 0) {
        return;
      }
      factorSequence.push(sequence[i] / lastValue);
      lastValue = sequence[i];
    }
    if (factorSequence.length === 0) {
      return;
    }
    if (!Number.isInteger(factorSequence[0])) {
      const first = factorSequence[0];
      for (let i = 1; i < factorSequence.length; i++) {
        if (factorSequence[1] !== first) {
          return;
        }
        yield new GeometricPattern(new ConstantPattern(first));
        return;
      }
    }
    const iterator = matcher.queryPattern(
      factorSequence,
      QueryStrategyFactory.createBasicStrategy(),
    );
    let iteratorResult = iterator.next();
    while (!iteratorResult.done) {
      if (iteratorResult.value !== undefined) {
        yield new GeometricPattern(iteratorResult.value);
      } else {
        yield;
      }
      iteratorResult = iterator.next();
    }
  }
}
