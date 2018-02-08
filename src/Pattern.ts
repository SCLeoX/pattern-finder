import { Matcher } from './Matcher';

export abstract class Pattern {
  public abstract toString(parentheses: boolean): string;
  public abstract get(index: number): number;
  public shift(shiftAmount: number): Pattern {
    return new ShiftedPattern(this, shiftAmount);
  }
}

/**
 * Pattern factories are responsible for creating patterns according to query.
 * The entire query process can take multiple stage to finish. Thus, the
 * factories' query functions should be generators so the query process can be
 * splitted.
 * The iterator of the generator should be able to return one of true values.
 * - A pattern, if that pattern matches the query.
 * - Null, if this step did not yield any meaningful result.
 */
export abstract class PatternFactory {
  public abstract identifier: string;
  public abstract querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern>;
}

export class ShiftedPattern extends Pattern {
  public constructor(
    public originalPattern: Pattern,
    public shiftAmount: number,
  ) {
    super();
  }
  public toString(parentheses: boolean): string {
    if (this.shiftAmount === 0) {
      return this.originalPattern.toString(parentheses);
    }
    let result = this.originalPattern.toString(true) + '<<' + this.shiftAmount;
    if (parentheses) {
      result = '(' + result + ')';
    }
    return result;
  }
  public get(index: number): number {
    return this.originalPattern.get(index + this.shiftAmount);
  }
  public shift(shiftAmount: number): Pattern {
    return new ShiftedPattern(
      this.originalPattern,
      this.shiftAmount + shiftAmount,
    );
  }
}
