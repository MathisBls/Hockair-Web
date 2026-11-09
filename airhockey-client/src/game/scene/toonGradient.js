import { DataTexture, NearestFilter, RedFormat } from 'three';

const TOON_STEPS = [90, 170, 255];

let sharedToonGradient = null;

export const getToonGradient = () => {
  if (sharedToonGradient) {
    return sharedToonGradient;
  }
  const texture = new DataTexture(
    new Uint8Array(TOON_STEPS),
    TOON_STEPS.length,
    1,
    RedFormat
  );
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  sharedToonGradient = texture;

  return texture;
};
