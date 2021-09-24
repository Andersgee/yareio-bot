import { add, mul } from "./vec";

/**
 * ```raw
 * Return 3 lists of points for contours of triangle,square and circle, each with
 * 1. N number of vertices
 * 2. same area inside
 * 3. centered of mass at origin
 *
 * note: N must be a multiple of 12.
 *
 * width specifies width of triangle base, which everything else is derived from.
 * ```
 */
export function countourshapes(
  width: number,
  place: Vec2,
  scale = 1,
  N = 12
): {
  triangle: Vec2[];
  square: Vec2[];
  circle: Vec2[];
} {
  const t = triangle(width, N);
  const s = squareFromArea(t.area, N);
  const c = circleFromArea(t.area, N);

  return {
    triangle: flipy(t.verts).map((p) => add(place, mul(p, scale))),
    square: flipy(s.verts).map((p) => add(place, mul(p, scale))),
    circle: flipy(c.verts).map((p) => add(place, mul(p, scale))),
  };
}

function flipy(v: Vec2s): Vec2s {
  return v.map((p) => [p[0], -p[1]]);
}

/**
 * the height of equilateral triangle from base width
 */
function triangleHeight(b: number): number {
  return (Math.sqrt(3) / 2) * b;
}

/**
 * the center of mass from 3 vertices
 */
function triangleCentroid(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  return [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
}

function triangleArea(b: number, h: number): number {
  return (b * h) / 2;
}

function triangle(width: number, N: number): { verts: Vec2s; area: number } {
  const b = width;
  const h = triangleHeight(b);
  const area = triangleArea(b, h);

  const p0: Vec2 = [0, 0];
  const p1: Vec2 = [b, 0];
  const p2: Vec2 = [b / 2, h];
  const k = triangleCentroid(p0, p1, p2);

  const Nperside = N / 3;
  const steplen = b / Nperside;
  const bottom: Vec2s = new Array(Nperside)
    .fill([0, 0])
    .map((x, i) => [steplen * i - k[0], 0 - k[1]]);
  const side1: Vec2s = bottom.map((p) => rotate(p, ((2 * Math.PI) / 3) * 1));
  const side2: Vec2s = bottom.map((p) => rotate(p, ((2 * Math.PI) / 3) * 2));

  const verts: Vec2s = bottom.concat(side1).concat(side2);

  return { verts, area };
}

function circleRadiusFromArea(A: number): number {
  //A = pi*r*r
  //r = sqrt(A/pi)
  return Math.sqrt(A / Math.PI);
}

function squareSizeFromArea(A: number): number {
  //A = b*b
  //b = sqrt(A)
  return Math.sqrt(A);
}

function squareFromArea(A: number, N: number): { verts: Vec2s } {
  const w = squareSizeFromArea(A);
  const k = w / 2;

  const Nperside = N / 4;
  const steplen = w / Nperside;
  const a: Vec2s = new Array(Nperside)
    .fill([0, 0])
    .map((x, i) => [steplen * i - k, 0 - k]);
  const b: Vec2s = new Array(Nperside)
    .fill([0, 0])
    .map((x, i) => [w - k, steplen * i - k]);
  const c: Vec2s = new Array(Nperside)
    .fill([0, 0])
    .map((x, i) => [w - steplen * i - k, w - k]);
  const d: Vec2s = new Array(Nperside)
    .fill([0, 0])
    .map((x, i) => [0 - k, w - steplen * i - k]);

  const verts = a.concat(b).concat(c).concat(d);
  return { verts };
}

//rotate p around origo by radians
function rotate(p: Vec2, radians: number): Vec2 {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return [cos * p[0] + sin * p[1], cos * p[1] - sin * p[0]];
}

function circleFromArea(A: number, N: number): { verts: Vec2s } {
  const r = circleRadiusFromArea(A);

  const rotamount = (2 * Math.PI) / N;
  const verts = new Array(N)
    .fill([-r, 0])
    .map((p, i) => rotate(p, rotamount * i));
  return { verts };
}
