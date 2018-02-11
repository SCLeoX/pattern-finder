import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';

export class FibPattern extends Pattern {
  public static cacheMap: Map<string, Array<number>> = new Map();
  public cache: Array<number> = [];
  public amount: number;
  public constructor(
    public initialConditions: Array<number>,
  ) {
    super();
    this.amount = initialConditions.length;
    const identifier = this.toString(false);
    let cache = FibPattern.cacheMap.get(identifier);
    if (cache === undefined) {
      FibPattern.cacheMap.set(identifier, cache = initialConditions.slice());
    }
    this.cache = cache;
  }
  public toString(parentheses: boolean): string {
    return `Fib(${this.initialConditions.join(', ')})`;
  }
  public get(index: number): number {
    if (index >= this.cache.length) {
      for (let i = this.cache.length; i <= index; i++) {
        let sum = 0;
        for (let j = i - this.amount; j < i; j++) {
          sum += this.cache[j];
        }
        this.cache[i] = sum;
      }
    }
    return this.cache[index];
  }
}

export class FibPatternFactory extends PatternFactory {
  public identifier: string = 'Fib';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    for (let amount = 2; amount < sequence.length; amount++) {
      let flag = true;
      for (let testing = amount; testing < sequence.length; testing++) {
        let sum = 0;
        for (let i = testing - amount; i < testing; i++) {
          sum += sequence[i];
        }
        if (sum !== sequence[testing]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        yield new FibPattern(sequence.slice(0, amount));
      } else {
        yield;
      }
    }
  }
}
