import { LinkedList } from '../LinkedList';
import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';
import { QueryStrategyFactory } from '../QueryStrategy';
import { ConstantPattern } from './ConstantPattern';

export class AddBiPattern extends Pattern {
  public constructor(
    public a: Pattern,
    public b: Pattern,
  ) {
    super();
  }
  public toString(parentheses: boolean): string {
    let result = `${this.a.toString(true)} + ${this.b.toString(true)}`;
    if (parentheses) {
      result = `(${result})`;
    }
    return result;
  }
  public get(index: number): number {
    return this.a.get(index) + this.b.get(index);
  }
}

const constantAddBiBlackList = new Set(['ConstantAddBi', 'Alt']);
interface ILabeledIterator {
  label: number;
  iterator: Iterator<undefined | Pattern>;
}
export class ConstantAddBiPatternFactory extends PatternFactory {
  public identifier: string = 'ConstantAddBi';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    const iterators: LinkedList<ILabeledIterator> = new LinkedList();
    const startNewQuery = (addBy: number) => {
      const newSequence: Array<number> = [];
      for (const value of sequence) {
        newSequence.push(value - addBy);
      }
      iterators.append({
        label: addBy,
        iterator: matcher.queryPattern(
          newSequence,
          QueryStrategyFactory.createBasicStrategy(constantAddBiBlackList),
        )},
      );
    };
    // We want to test the opposite number of the first element first as it is
    // very likely to be the case.
    if (sequence[0] !== 0) {
      startNewQuery(sequence[0]);
    }
    let currentAdd = -1;
    while (true) {
      const iteratorsIterator = iterators.iterate();
      let iteratorsIteratorResult = iteratorsIterator.next();
      while (!iteratorsIteratorResult.done) {
        const { iterator, label } = iteratorsIteratorResult.value;
        const iteratorResult = iterator.next();
        if (iteratorResult.value === undefined) {
          yield undefined;
        } else {
          yield new AddBiPattern(
            new ConstantPattern(label),
            iteratorResult.value,
          );
        }
        iteratorsIteratorResult = iteratorsIterator.next(iteratorResult.done
          ? null
          : undefined);
      }
      if (currentAdd !== sequence[0]) {
        startNewQuery(currentAdd);
      }
      if (currentAdd < 0) {
        currentAdd *= -1;
      } else {
        currentAdd = -(currentAdd + 1);
      }
    }
  }
}
