export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function logScale(t, min, max) {
  return min * Math.pow(max / min, t);
}
