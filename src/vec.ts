/** [v1[0] + v2[0], v1[1] + v2[1]] */
export function add(v1: Vec2, v2: Vec2): Vec2 {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

/** [v[0] * k, v[1] * k] */
export function mul(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}
/** [v[0] / k, v[1] / k]*/
export function div(v: Vec2, k: number): Vec2 {
  return [v[0] / k, v[1] / k];
}

/** Length of a Vec2 */
export function len(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

/** Sum values of v */
export function sum(v: number[]): number {
  let sum = 0;
  for (const x of v) {
    sum += x;
  }
  return sum;
}

export function dot(v1: Vec2, v2: Vec2): number {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

export function normalize(v: Vec2): Vec2 {
  const l = len(v);
  return [v[0] / l, v[1] / l];
}

/**
 * Return the minimum value and its index in vector vec
 * (return value: Infinity if vec=[])
 */
export function minimum(vec: Vec): { value: number; index: number } {
  let index = -1;
  let value = Infinity;
  for (const [i, v] of vec.entries()) {
    if (v < value) {
      value = v;
      index = i;
    }
  }
  return { value, index };
}

/**
 * Return the maximum value and its index in vector vec
 * * (return value: -Infinity if vec=[])
 */
export function maximum(vec: Vec): { value: number; index: number } {
  let index = -1;
  let value = -Infinity;
  for (const [i, v] of vec.entries()) {
    if (v > value) {
      value = v;
      index = i;
    }
  }
  return { value, index };
}

/**
 * offset p1 a maximum of 20 units toward p2 (stop at p2)
 */
export function offsetmax20(p1: Vec2, p2: Vec2): Vec2 {
  const d = Math.min(20, dist(p1, p2));
  return offset(p1, p2, d);
}

/**
 * Return a vector without duplicate values.
 */
export function unique(v: Vec): Vec {
  return [...new Set(v)];
}

/**
 * Return a vector that points from p1 to p2.
 */
export function vecFromPositions(p1: Vec2, p2: Vec2): Vec2 {
  return [p2[0] - p1[0], p2[1] - p1[1]];
}

/**
 * Return a unitvector that points from p1 to p2.
 */
export function unitvecFromPositions(p1: Vec2, p2: Vec2): Vec2 {
  return normalize(vecFromPositions(p1, p2));
}

export function dist(p1: Vec2, p2: Vec2): number {
  const v = vecFromPositions(p1, p2);
  return len(v);
}

/**
 * ```raw
 * True if distance between p1 and p2 is leq than d.
 *
 * default d=200 which is ship range
 * ```
 */
export function isWithinDist(p1: Vec2, p2: Vec2, d = 200): boolean {
  return dist(p1, p2) <= d;
}

/**
 * normalization followed by dot product gives a measure of direction similarity -1..1 zero means perpendicular
 */
export function directionSimilarity(v1: Vec2, v2: Vec2): number {
  return dot(normalize(v1), normalize(v2));
}

/**
 * clamp x to lie in a..b range
 */
export function clamp(x: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, x));
}

function clamp01(x: number): number {
  return clamp(x, 0, 1);
}

/**
 * ```raw
 * Return a point that lies fraction t from p1 toward p2, default t=0.5
 * ```
 */
export function mix(p1: Vec2, p2: Vec2, t = 0.5): Vec2 {
  const v = vecFromPositions(p1, p2);
  const v_scaled = mul(v, clamp01(t)); //might not want to clamp t?
  const p = add(p1, v_scaled);
  return p;
}

/**
 * ```raw
 * Return a point that lies distance d away from p1, in the direction of p2.
 * note: d can be negative
 * ```
 */
export function offset(p1: Vec2, p2: Vec2, d: number): Vec2 {
  if (Math.abs(d) < 0.000000001) {
    return p1;
  }
  if (dist(p1, p2) < 0.00000001) {
    return p2;
  }
  const unitvec = unitvecFromPositions(p1, p2);
  const v = mul(unitvec, d);
  const p = add(p1, v);
  return p;
}

/**
 *```raw
 * The points where a line from p1 would tangent a circle at center p2 with radius r
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no tangentpoint exist. (it means p is inside the circle)
 * ```
 */
export function tangentPoints(p: Vec2, c: Vec2, r: number): Vec2[] {
  //https://math.stackexchange.com/questions/543496/how-to-find-the-equation-of-a-line-tangent-to-a-circle-that-passes-through-a-g

  //r is radius of circle with center c
  const Cx = c[0];
  const Cy = c[1];
  const Px = p[0];
  const Py = p[1];

  const dx = Px - Cx;
  const dy = Py - Cy;

  const dxr = -dy;
  const dyr = dx;

  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < r) {
    return []; //no tangentpoints (p is inside circle c)
  }

  const rho = r / d;
  const ad = rho * rho;
  const bd = rho * Math.sqrt(1 - rho * rho);

  const T1x = Cx + ad * dx + bd * dxr;
  const T1y = Cy + ad * dy + bd * dyr;
  const T2x = Cx + ad * dx - bd * dxr;
  const T2y = Cy + ad * dy - bd * dyr;

  //tangentpoints
  const tp1: Vec2 = [T1x, T1y];
  const tp2: Vec2 = [T2x, T2y];
  return [tp1, tp2];
}

/**
 * Return either vector v1 or v2
 *
 * whichever points in the direction most similar to the direciton of vector v
 */
export function mostSimilarVec(v1: Vec2, v2: Vec2, v: Vec2): Vec2 {
  const s1 = directionSimilarity(v, v1);
  const s2 = directionSimilarity(v, v2);
  const v_mostsimilar = s1 > s2 ? v1 : v2;
  return v_mostsimilar;
}

/**
 * ```raw
 * Where a circle at p1 with radius r1 intersects a circle at p2 with radius r2.
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no intersection exist.
 * ```
 */
export function intersectTwoCircles(
  p1: Vec2,
  r1: number,
  p2: Vec2,
  r2: number
): Vec2[] {
  //https://gist.github.com/jupdike/bfe5eb23d1c395d8a0a1a4ddd94882ac
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];
  const centerdx = x1 - x2;
  const centerdy = y1 - y2;
  const R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) {
    return []; // no intersections
  }
  // intersection(s) should exist

  const R2 = R * R;
  const R4 = R2 * R2;
  const a = (r1 * r1 - r2 * r2) / (2 * R2);
  const r2r2 = r1 * r1 - r2 * r2;
  const c = Math.sqrt((2 * (r1 * r1 + r2 * r2)) / R2 - (r2r2 * r2r2) / R4 - 1);

  const fx = (x1 + x2) / 2 + a * (x2 - x1);
  const gx = (c * (y2 - y1)) / 2;
  const ix1 = fx + gx;
  const ix2 = fx - gx;

  const fy = (y1 + y2) / 2 + a * (y2 - y1);
  const gy = (c * (x1 - x2)) / 2;
  const iy1 = fy + gy;
  const iy2 = fy - gy;

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  return [
    [ix1, iy1],
    [ix2, iy2],
  ];
}

/**
 * intersectTwoCircles but pick the point (of the two points) nearest to targetpoint
 */
export function intersectPoint(
  p1: Vec2,
  r1: number,
  p2: Vec2,
  r2: number,
  targetpoint: Vec2
): Vec2 {
  const ps = intersectTwoCircles(p1, r1, p2, r2);
  return nearestPointOfPoints(ps, targetpoint);
}

/**
 * intersectTwoCircles but pick the point (of the two points) farthest away from targetpoint
 */
export function intersectPointFarthest(
  p1: Vec2,
  r1: number,
  p2: Vec2,
  r2: number,
  targetpoint: Vec2
): Vec2 {
  const ps = intersectTwoCircles(p1, r1, p2, r2);
  return farthestPointOfPoints(ps, targetpoint);
}

/**
 * perpendicular Clockwise
 */
export function perpendicularCW(v: Vec2): Vec2 {
  return [v[1], -v[0]];
}

/**
 * perpendicular Counter Clockwise
 */
export function perpendicularCCW(v: Vec2): Vec2 {
  return [-v[1], v[0]];
}

/**
 * Return a boolean vector filled with false
 */
export function falses(n: number): boolean[] {
  return new Array(n).fill(false);
}

/**
 * Return a boolean vector filled with true
 */
export function trues(n: number): boolean[] {
  return new Array(n).fill(true);
}

/**
 * Return true if all elements in v are true
 */
export function all(v: boolean[]): boolean {
  return v.every((x) => x === true);
}

/**
 * Return true if any element in v is true
 */
export function any(v: boolean[]): boolean {
  return v.some((x) => x === true);
}

/**
 * Return true if all elements in v are false
 */
export function none(v: boolean[]): boolean {
  return !any(v);
}

/**
 * Return a new vector of length n, filled with x (default x=0)
 */
export function newVec(n: number, x = 0): Vec {
  return new Array(n).fill(x);
}

/**
 * Returns a new vector [0,1,2,...,n-1]
 * starting from x default 0
 */
export function indexVec(n: number, x = 0): Vec {
  const v = new Array(n).fill(0);
  return v.map((v, i) => i + x);
}

/**
 * modifies v.
 *
 * Remove first item from and return it.
 * (v.pop() removes last item and returns it)
 */
export function popfirst(v: Vec): number {
  const x = v.shift();
  if (x === undefined) {
    return -1; //make typescript happy
  } else {
    return x;
  }
}

/**
 * modifies v.
 *
 * Put x at the begining of v and return v
 *  * (v.push(x) puts x at end)
 */
export function pushfirst(v: Vec, x: number): Vec {
  //const len = v.unshift(x);
  v.unshift(x);
  return v;
}

/**
 * Construct a circle from 3 points on its circumference.
 *
 * Return [centerpoint, radius]
 */
export function circleFrom3points(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2
): [Vec2, number] {
  //https://math.stackexchange.com/questions/213658/get-the-equation-of-a-circle-when-given-3-points
  const x1 = p1[0];
  const y1 = p1[1];

  const x2 = p2[0];
  const y2 = p2[1];

  const x3 = p3[0];
  const y3 = p3[1];

  const A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
  const B =
    (x1 * x1 + y1 * y1) * (y3 - y2) +
    (x2 * x2 + y2 * y2) * (y1 - y3) +
    (x3 * x3 + y3 * y3) * (y2 - y1);

  const C =
    (x1 * x1 + y1 * y1) * (x2 - x3) +
    (x2 * x2 + y2 * y2) * (x3 - x1) +
    (x3 * x3 + y3 * y3) * (x1 - x2);

  const D =
    (x1 * x1 + y1 * y1) * (x3 * y2 - x2 * y3) +
    (x2 * x2 + y2 * y2) * (x1 * y3 - x3 * y1) +
    (x3 * x3 + y3 * y3) * (x2 * y1 - x1 * y2);

  const center: Vec2 = [-B / (2 * A), -C / (2 * A)];

  const radius = Math.sqrt((B * B + C * C - 4 * A * D) / (4 * A * A));

  return [center, radius];
}

/**
 * ```raw
 * Weighted mean, where weighting coefficient for each data point is
 * the inverse sum of distances between this data point and the other data points
 * ```
 */
export function distanceWeightedMean(points: Vec2[]): Vec2 {
  //https://encyclopediaofmath.org/wiki/Distance-weighted_mean
  if (points.length === 1) {
    return points[0];
  }
  //const k = points.length;
  const k = 1;

  const w: Vec = [];
  for (const point of points) {
    const sumdistances = sum(points.map((p) => dist(p, point)));
    w.push(k / sumdistances);
  }
  const sumw = sum(w);

  const wx = sum(points.map((p, i) => w[i] * p[0]));
  const wy = sum(points.map((p, i) => w[i] * p[1]));

  const x = wx / sumw;
  const y = wy / sumw;
  //if all points are the same (or there is only a single point) this produces [NaN,NaN]
  if (isNaN(x) || isNaN(y)) {
    return points[0];
  } else {
    return [x, y];
  }
}

export function weightedmean(points: Vec2[], weights: Vec): Vec2 {
  const x = sum(points.map((p, i) => weights[i] * p[0]));
  const y = sum(points.map((p, i) => weights[i] * p[1]));
  const weightsum = sum(weights);
  return [x / weightsum, y / weightsum];
}

/**
 * Return the point in the vector ps=[p1,p2,p2] that is closest to target point targetpoint
 */
export function nearestPointOfPoints(ps: Vec2[], targetpoint: Vec2): Vec2 {
  const d = ps.map((p) => dist(p, targetpoint));
  const i = minimum(d).index;
  return ps[i];
}

/**
 * Return the point in the vector ps=[p1,p2,p2] that is farthest away from point targetpoint
 */
export function farthestPointOfPoints(ps: Vec2[], targetpoint: Vec2): Vec2 {
  const d = ps.map((p) => dist(p, targetpoint));
  const i = maximum(d).index;
  return ps[i];
}

/**
 * A*x^2 + B*x + C = 0
 * return [x1,x2]
 */
function quadraticroots(A: number, B: number, C: number) {
  const r = Math.sqrt(B * B - 4 * A * C);
  const x1 = (-B + r) / (2 * A);
  const x2 = (-B - r) / (2 * A);
  return [x1, x2];
}

/**
 * ```raw
 * return two points [a, b] where (infinite) line created by p1->p2 intersects circle with center center and radius r.
 *
 * note: return empty list [] if no intersection exist.
 * ```
 */
export function intersectLineCircle(
  p1: Vec2,
  p2: Vec2,
  center: Vec2,
  r: number
): Vec2[] {
  //https://math.stackexchange.com/questions/228841/how-do-i-calculate-the-intersections-of-a-straight-line-and-a-circle
  const x1 = p1[0];
  const y1 = p1[1];
  const x2 = p2[0];
  const y2 = p2[1];

  const p = center[0];
  const q = center[1];

  if (x1 === x2) {
    //vertical line
    const k = x1;
    const A = 1;
    const B = -2 * q;
    const C = p * p + q * q - r * r - 2 * k * p + k * k;
    if (B * B - 4 * A * C < 0) {
      //no intersection
      return [];
    }
    const [y_1, y_2] = quadraticroots(A, B, C);
    return [
      [k, y_1],
      [k, y_2],
    ];
  }

  const m = (y2 - y1) / (x2 - x1);
  const c = y1 - m * x1;

  const A = m * m + 1;
  const B = 2 * (m * c - m * q - p);
  const C = q * q - r * r + p * p - 2 * c * q + c * c;

  if (B * B - 4 * A * C < 0) {
    //no intersection
    return [];
  }

  const [x_1, x_2] = quadraticroots(A, B, C);

  //y = m*x + c
  const y_1 = m * x_1 + c;
  const y_2 = m * x_2 + c;
  return [
    [x_1, y_1],
    [x_2, y_2],
  ];
}

/**
 * smallest first
 */
export function sortAscending(v: Vec): Vec {
  return v.slice().sort((a, b) => a - b);
}

/**
 * biggest first
 */
export function sortDescending(v: Vec): Vec {
  return v.slice().sort((a, b) => b - a);
}
