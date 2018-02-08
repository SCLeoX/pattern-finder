import { PatternFactory } from './Pattern';
import { ConstantAddBiPatternFactory } from './patterns/AddBiPattern';
import { ConstantPatternFactory } from './patterns/ConstantPattern';
import { DiffPatternFactory } from './patterns/DiffPattern';
import { GeometricPatternFactory } from './patterns/GeometricPattern';
import { ConstantMultiplyBiPatternFactory } from './patterns/MultiplyBiPattern';

const map = new Map<string, PatternFactory>();

export const patternFactoryRegistry = {
  get(patternFactoryId: string): PatternFactory {
    const factory = map.get(patternFactoryId);
    if (factory === undefined) {
      throw new Error(`Unknown pattern factory: ${patternFactoryId}`);
    }
    return factory;
  },
};

const register = (patternFactory: PatternFactory) => {
  map.set(patternFactory.identifier, patternFactory);
};

register(new ConstantPatternFactory());
register(new DiffPatternFactory());
register(new ConstantAddBiPatternFactory());
register(new GeometricPatternFactory());
register(new ConstantMultiplyBiPatternFactory());
