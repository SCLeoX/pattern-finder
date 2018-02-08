import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';
import { QueryStrategyFactory } from '../QueryStrategy';

export class DiffPattern extends Pattern {
  public static cacheMap: Map<string, Array<number>> = new Map();
  public cache: Array<number>;
  public constructor(
    public deltaPattern: Pattern,
  ) {
    super();
    const identifier = deltaPattern.toString(false);
    let cache = DiffPattern.cacheMap.get(identifier);
    if (cache === undefined) {
      DiffPattern.cacheMap.set(identifier, cache = [deltaPattern.get(0)]);
    }
    this.cache = cache;
  }
  public toString(parentheses: boolean): string {
    return `Diff(${this.deltaPattern.toString(false)})`;
  }
  public get(index: number): number {
    if (index === 0) {
      return 0;
    }
    if (this.cache.length < index) {
      let deltaPatternReadAt = this.cache.length;
      for (let i = this.cache.length; i < index; i++) {
        this.cache[i]
          = this.cache[i - 1] + this.deltaPattern.get(deltaPatternReadAt);
        deltaPatternReadAt++;
      }
    }
    return this.cache[index - 1];
  }
}

const diffBlackList = new Set(['Geometric', 'ConstantMultiplyBi']);
export class DiffPatternFactory extends PatternFactory {
  public identifier: string = 'Diff';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    if (sequence[0] !== 0) {
      return;
    }
    const deltaSequence: Array<number> = [];
    let lastValue: number = 0;
    for (let i = 1; i < sequence.length; i++) {
      deltaSequence.push(sequence[i] - lastValue);
      lastValue = sequence[i];
    }
    if (deltaSequence.length === 0) {
      return;
    }
    const iterator = matcher.queryPattern(
      deltaSequence,
      QueryStrategyFactory.createBasicStrategy(diffBlackList),
    );
    let iteratorResult = iterator.next();
    while (!iteratorResult.done) {
      if (iteratorResult.value !== undefined) {
        yield new DiffPattern(iteratorResult.value);
      } else {
        yield;
      }
      iteratorResult = iterator.next();
    }
  }
}
