/**
 * Return a vector without duplicate values.
 */
export function unique(v: Vec): Vec {
  return [...new Set(v)];
}

/**
 * Sum values of v
 */
export function sum(v: number[]): number {
  let sum = 0;
  for (const x of v) {
    sum += x;
  }
  return sum;
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
  return Math.hypot(v[0], v[1]);
}

/**
 * True if distance between p1 and p2 is less than or equal to d.
 */
export function isWithinDist(p1: Vec2, p2: Vec2, d: number): boolean {
  return dist(p1, p2) <= d;
}

/**
 * Length of a Vec2
 */
export function len(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

export function normalize(v: Vec2): Vec2 {
  const l = len(v);
  return [v[0] / l, v[1] / l];
}

function dot(v1: Vec2, v2: Vec2): number {
  return v1[0] * v2[0] + v1[1] * v2[1];
}

/**
 * normalization followed by dot product gives a measure of direction similarity
 */
function directionSimilarity(v1: Vec2, v2: Vec2): number {
  return dot(normalize(v1), normalize(v2));
}

export function add(v1: Vec2 | Vec2, v2: Vec2): Vec2 {
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

export function mul(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}

function clamp(x: number, a: number, b: number) {
  return Math.min(b, Math.max(a, x));
}

function clamp01(x: number) {
  return clamp(x, 0, 1);
}

/**
 * ```raw
 * Return a point that lies t from p1 toward p2
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
export function offsetByDist(p1: Vec2, p2: Vec2, d: number): Vec2 {
  const unitvec = normalize(vecFromPositions(p1, p2));
  const v = mul(unitvec, d);
  const p = add(p1, v);
  return p;
}

/**
 * ```raw
 * Return a point that lies distance d away from p1, in the direction of p2.
 * note: d can be negative
 * ```
 */
export function offset(p1: Vec2, p2: Vec2, d: number): Vec2 {
  const unitvec = normalize(vecFromPositions(p1, p2));
  const v = mul(unitvec, d);
  const p = add(p1, v);
  return p;
}

/**
 *```raw
 * The points where a line from p1 would tangent a circle at center p2 with radius r
 *
 * Returns 2 points as list [p1, p2] or
 * returns empty list [] if no tangentpoint exist. (it means p1 is inside the circle)
 * ```
 */
function tangentPoints(p1: Vec2, p2: Vec2, r: number): Vec2[] {
  //https://math.stackexchange.com/questions/543496/how-to-find-the-equation-of-a-line-tangent-to-a-circle-that-passes-through-a-g

  //r is radius of p2
  const Cx = p2[0];
  const Cy = p2[1];
  const Px = p1[0];
  const Py = p1[1];

  const dx = Px - Cx;
  const dy = Py - Cy;

  const dxr = -dy;
  const dyr = dx;

  const d = Math.sqrt(dx * dx + dy * dy);
  if (d >= r) {
    return []; //no tangentpoints (p1 is inside circle p2)
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
 * Returns two vectors.
 * The vectors are pointing from p1 to the tangent points of circle p2 with radius r
 */
function tangentVecs(p1: Vec2, p2: Vec2, r: number): Vec2[] {
  const [tp1, tp2] = tangentPoints(p1, p2, r);
  const v1 = vecFromPositions(p1, tp1);
  const v2 = vecFromPositions(p1, tp2);
  return [v1, v2];
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
 * Return a vector.
 * The vector from p1 tangent to circle at p2 with radius r.
 * There are two such vectors but this function return the one most similar to the direction of vector v.
 *```
 */
export function tangentVecSimilarTo(
  p1: Vec2,
  p2: Vec2,
  r: number,
  v: Vec2
): Vec2 {
  const [v1, v2] = tangentVecs(p1, p2, r);
  return mostSimilarVec(v1, v2, v);
}

/**
 * Return the minimum value and its index in vector vec
 * (return value: Infinity if vec=[])
 */
export function minimum(vec: number[]): { value: number; index: number } {
  let index = -1;
  let value = Infinity;
  for (const [i, v] of vec.entries()) {
    if (v < value) {
      value = v;
      index = i;
    }
  }
  const r = { value, index };
  return r;
}

/**
 * Return the maximum value and its index in vector vec
 * * (return value: -Infinity if vec=[])
 */
export function maximum(vec: number[]): { value: number; index: number } {
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
 * Return a point adjusted_p the ship can move to that avoids the circle c with radius r
 *
 * 1. if not inside and would not intersect the circle: return desired_p as is
 * 2. if inside: return a point that is straight outward from the circle center
 * 3. if would become inside (direction intersects): return a point that tangents the circle
 *
 */
export function avoidCircle(
  ship: Ship,
  desired_p: Vec2,
  c: Vec2,
  r: number
): Vec2 {
  const dir_desired = unitvecFromPositions(ship.position, desired_p);
  const tps = tangentPoints(ship.position, c, r);

  if (tps.length === 0) {
    //inside circle
    const dir_outward = unitvecFromPositions(c, ship.position);
    const adjusted_p = add(ship.position, mul(dir_outward, 20));
    return adjusted_p;
  } else {
    //outside circle
    const dir_circlecenter = unitvecFromPositions(ship.position, c);
    if (directionSimilarity(dir_desired, dir_circlecenter) < 0) {
      //going desired dir will NOT intersect circle
      return desired_p;
    } else {
      //going desired dir WILL intersect circle
      const dir_tangent0 = unitvecFromPositions(ship.position, tps[0]);
      const dir_tangent1 = unitvecFromPositions(ship.position, tps[1]);
      const dir_tangent = mostSimilarVec(
        dir_tangent0,
        dir_tangent1,
        dir_desired
      );
      const adjusted_p = add(ship.position, mul(dir_tangent, 20));
      return adjusted_p;
    }
  }
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
 * Return [center, radius]
 */
export function circleFrom3points(
  p1: Vec2,
  p2: Vec2,
  p3: Vec2
): { center: Vec2; radius: number } {
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

  return { center, radius };
}
