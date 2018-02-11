import { LinkedList } from '../LinkedList';
import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';
import { QueryStrategyFactory } from '../QueryStrategy';
import { ConstantPattern } from './ConstantPattern';

export class MultiplyBiPattern extends Pattern {
  public constructor(
    public a: Pattern,
    public b: Pattern,
  ) {
    super();
  }
  public toString(parentheses: boolean): string {
    let result = `${this.a.toString(true)} * ${this.b.toString(true)}`;
    if (parentheses) {
      result = `(${result})`;
    }
    return result;
  }
  public get(index: number): number {
    return this.a.get(index) * this.b.get(index);
  }
}

const getDivisors = (n: number): Array<number> => {
  const result: Array<number> = [];
  const end = Math.floor(Math.sqrt(n));
  for (let i = 2; i <= end; i++) {
    if (n % i === 0) {
      result.push(i);
      if (i * i !== n) {
        result.push(n / i);
      }
    }
  }
  return result;
};

const constantMultiplyBiBlacklist = new Set([
  'ConstantMultiplyBi',
  'ConstantAddBi',
  'Alt',
]);
interface ILabeledIterator {
  label: number;
  iterator: Iterator<undefined | Pattern>;
}
export class ConstantMultiplyBiPatternFactory extends PatternFactory {
  public identifier: string = 'ConstantMultiplyBi';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    let max = Math.abs(sequence[0]);
    for (let i = 1; i < sequence.length; i++) {
      const value = Math.abs(sequence[i]);
      if (value > Number.MAX_SAFE_INTEGER) {
        return;
      }
      if (value > max) {
        max = value;
      }
    }
    const divisors = getDivisors(max);
    const iterators: LinkedList<ILabeledIterator> = new LinkedList();
    const startNewQuery = (multiplyBy: number) => {
      const newSequence: Array<number> = [];
      for (const value of sequence) {
        const newValue = value / multiplyBy;
        if (!Number.isInteger(newValue)) {
          return;
        }
        newSequence.push(newValue);
      }
      iterators.append({
        label: multiplyBy,
        iterator: matcher.queryPattern(
          newSequence,
          QueryStrategyFactory.createBasicStrategy(constantMultiplyBiBlacklist),
        )},
      );
    };
    startNewQuery(-1);
    while (divisors.length > 0 || iterators.length > 0) {
      const iteratorsIterator = iterators.iterate();
      let iteratorsIteratorResult = iteratorsIterator.next();
      while (!iteratorsIteratorResult.done) {
        const { iterator, label } = iteratorsIteratorResult.value;
        const iteratorResult = iterator.next();
        if (iteratorResult.value === undefined) {
          yield undefined;
        } else {
          yield new MultiplyBiPattern(
            new ConstantPattern(label),
            iteratorResult.value,
          );
        }
        iteratorsIteratorResult = iteratorsIterator.next(iteratorResult.done
          ? null
          : undefined);
      }
      if (divisors.length > 0) {
        const nextDivisor = divisors.shift() as number;
        startNewQuery(nextDivisor);
        startNewQuery(-nextDivisor);
      }
    }
  }
}
