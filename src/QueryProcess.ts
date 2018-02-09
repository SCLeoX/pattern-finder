import { Matcher } from './Matcher';
import { Pattern } from './Pattern';
import { patternFactoryRegistry } from './patternFactoryRegistry';
import { QueryStrategyFactory } from './QueryStrategy';

const expectedTickTime = 1000 / 60;
const opsPerMeasure = 50;

export class QueryProcess {
  public matcher: Matcher;
  public sequence: Array<number>;
  public predictions: Set<string> = new Set();

  public totalSteps: number = 0;
  public totalMatches: number = 0;
  public totalTicks: number = 0;

  private running: boolean = true;
  public constructor(
    userInput: string,
    onMatchCb: (pattern: Pattern, predictions: Array<number>) => void,
    public onFinishCb: () => void,
  ) {
    const sequence = this.sequence = userInput
      .split(',')
      .map(str => str.trim())
      .filter(str => str !== '')
      .map(str => +str)
      .filter(num => !Number.isNaN(num));
    if (sequence.length === 0) {
      this.stop();
      return;
    }
    this.matcher = new Matcher(patternFactoryRegistry);
    const iterator = this.matcher.queryPattern(
      sequence,
      QueryStrategyFactory.createBasicStrategy(),
    );
    const tick = () => {
      if (!this.running) {
        return;
      }
      const t0 = new Date().getTime();
      const te = t0 + expectedTickTime;
      while (new Date().getTime() < te) {
        for (let i = 0; i < opsPerMeasure; i++) {
          const iteratorResult = iterator.next();
          if (iteratorResult.value !== undefined) {
            const pattern = iteratorResult.value;
            const predictions: Array<number> = [];
            for (let j = 0; j < 10; j++) {
              predictions.push(pattern.get(sequence.length + j));
            }
            const joined = predictions.join();
            if (!this.predictions.has(joined)) {
              this.predictions.add(joined);
              this.totalMatches++;
              onMatchCb(iteratorResult.value, predictions);
            }
          }

          this.totalSteps++;

          if (iteratorResult.done) {
            this.stop();
            return;
          }
        }
      }

      this.totalTicks++;

      setTimeout(tick, 1);
    };
    setTimeout(tick, 1);
  }
  public stop() {
    const running = this.running;
    this.running = false;
    if (running) {
      this.onFinishCb();
    }
  }
}
