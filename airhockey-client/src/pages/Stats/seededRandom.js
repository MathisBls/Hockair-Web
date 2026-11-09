const UINT32_RANGE = 4294967296;

export const createSeededRandom = (seed) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
};

export const pickRandomInteger = (random, minimum, maximum) =>
  minimum + Math.floor(random() * (maximum - minimum + 1));

export const pickCenteredRandom = (random) => random() * 2 - 1;
