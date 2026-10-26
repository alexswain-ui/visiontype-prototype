export interface Point {
  x: number;
  y: number;
}

/** Smooth path through the points: Catmull-Rom spline converted to cubic Bezier segments. */
export function smoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Three evenly spaced, rounded gridline values that contain all the data. */
export function niceTicks(values: number[]): [number, number, number] {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) || 1;
  const rough = (span * 1.25) / 2;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  let base = Math.floor(lo / step) * step;
  if (base + 2 * step < hi) base += step / 2;
  return [base, base + step, base + 2 * step];
}

/** "12.5M" style label for values already in millions. */
export function formatMillions(value: number): string {
  if (value >= 1000) return `${+(value / 1000).toFixed(1)}bn`;
  return `${+value.toFixed(1)}M`;
}
