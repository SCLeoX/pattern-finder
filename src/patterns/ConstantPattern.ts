import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';

export class ConstantPattern extends Pattern {
  public constructor(
    public value: number,
  ) {
    super();
  }
  public toString(parentheses: boolean): string {
    return `Constant(${this.value})`;
  }
  public get(index: number): number {
    return this.value;
  }
  public shift(shiftAmount: number): Pattern {
    return this;
  }
}

export class ConstantPatternFactory extends PatternFactory {
  public identifier: string = 'Constant';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    const first = sequence[0];
    for (let i = 1; i < sequence.length; i++) {
      if (first !== sequence[i]) {
        return;
      }
    }
    yield new ConstantPattern(first);
  }
}
