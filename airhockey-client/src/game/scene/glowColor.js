import { Color } from 'three';

export const createGlowColor = (hex, intensity = 2.5) =>
  new Color(hex).multiplyScalar(intensity);
