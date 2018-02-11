import { LinkedList } from '../LinkedList';
import { Matcher } from '../Matcher';
import { Pattern, PatternFactory } from '../Pattern';
import { QueryStrategyFactory } from '../QueryStrategy';

export class AltPattern extends Pattern {
  public amount: number;
  public constructor(
    public patterns: Array<Pattern>,
  ) {
    super();
    this.amount = this.patterns.length;
  }
  public toString(parentheses: boolean): string {
    return `Alt(${this.patterns.map(p => p.toString(false)).join(', ')})`;
  }
  public get(index: number): number {
    const pattern = this.patterns[index % this.amount];
    const subIndex = Math.floor(index / this.amount);
    return pattern.get(subIndex);
  }
}

const altPatternBlacklist = new Set(['Alt']);
const queryWithFixedAmount = function*(
  matcher: Matcher,
  fullSequence: Array<number>,
  amount: number,
): Iterator<undefined | Pattern> {
  const sequences: Array<Array<number>> = [];
  const iterators: Array<Iterator<undefined | Pattern> | null> = [];
  const foundPatterns: Array<Array<Pattern>> = [];
  const foundPatternSignatures: Array<Set<string>> = [];
  for (let i = 0; i < amount; i++) {
    sequences.push([]);
    foundPatterns.push([]);
    foundPatternSignatures.push(new Set());
  }
  for (let i = 0; i < fullSequence.length; i++) {
    sequences[i % amount].push(fullSequence[i]);
  }
  for (let i = 0; i < amount; i++) {
    iterators.push(matcher.queryPattern(
      sequences[i],
      QueryStrategyFactory.createBasicStrategy(altPatternBlacklist),
    ));
  }
  let availableIterators;
  do {
    availableIterators = 0;
    for (let i = 0; i < amount; i++) {
      const iterator = iterators[i];
      if (iterator === null) {
        continue;
      }
      const iteratorResult = iterator.next();
      const maybePattern = iteratorResult.value;
      if (iteratorResult.done) {
        iterators[i] = null;
      } else {
        availableIterators++;
      }
      if (maybePattern === undefined) {
        yield;
        continue;
      }
      const pattern = maybePattern;
      const array: Array<number> = [];
      const sequence = sequences[i];
      for (let j = sequence.length; j < sequence.length + 10; j++) {
        array.push(pattern.get(j));
      }
      const signature = array.join();
      if (foundPatternSignatures[i].has(signature)) {
        yield;
        continue;
      }
      foundPatternSignatures[i].add(signature);
      foundPatterns[i].push(pattern);
      const is: Array<number> = []; // i-s
      const ps: Array<Array<Pattern>> = []; // patterns-s
      const ms: Array<number> = []; // max-s
      let flag = false;
      for (let j = 0; j < amount; j++) {
        if (foundPatterns[j].length < 1) {
          flag = true;
          break;
        }
        is.push(0);
        if (i === j) {
          ps.push([pattern]);
          ms.push(0);
        } else {
          ps.push(foundPatterns[j]);
          ms.push(foundPatterns[j].length - 1);
        }
      }
      if (flag) {
        yield;
        continue;
      }
      let currentAdd;
      do {
        const patterns: Array<Pattern> = [];
        for (let j = 0; j < amount; j++) {
          patterns.push(ps[j][is[j]]);
        }
        yield new AltPattern(patterns);
        currentAdd = 0;
        let completed = false;
        while (!completed) {
          is[currentAdd]++;
          if (is[currentAdd] > ms[currentAdd]) {
            is[currentAdd] = 0;
            currentAdd++;
          } else {
            completed = true;
          }
        }
      } while (currentAdd < amount);
    }
  } while (availableIterators > 0);
};

const MAX_ALT_AMOUNT = 5;
export class AltPatternFactory extends PatternFactory {
  public identifier: string = 'Alt';
  public *querySequence(
    matcher: Matcher,
    sequence: Array<number>,
  ): Iterator<undefined | Pattern> {
    const maxAmount = Math.min(MAX_ALT_AMOUNT, Math.floor(sequence.length / 2));
    if (maxAmount < 2) {
      return;
    }
    let nextAddAmount = 2;
    const iterators: LinkedList<Iterator<undefined| Pattern>>
      = new LinkedList();
    while (iterators.length > 0 || nextAddAmount <= maxAmount) {
      if (nextAddAmount <= maxAmount) {
        iterators.append(
          queryWithFixedAmount(matcher, sequence, nextAddAmount),
        );
        nextAddAmount++;
      }
      const iteratorIterator = iterators.iterate();
      let iteratorIteratorResult = iteratorIterator.next();
      while (!iteratorIteratorResult.done) {
        const iterator = iteratorIteratorResult.value;
        const iteratorResult = iterator.next();
        yield iteratorResult.value;
        iteratorIteratorResult = iteratorIterator.next(iteratorResult.done
          ? null
          : undefined);
      }
    }
  }
}
