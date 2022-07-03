import {
  directionSimilarity,
  dist,
  intersectLineCircle,
  intersectTwoCircles,
  mix,
  nearestPointOfPoints,
  offset,
  offsetmax20,
  tangentPoints,
  unitvecFromPositions,
} from "./vec";

/**
 * ```raw
 * Return a point adjusted_p the ship can move to that avoids the circle c with radius r
 *
 * 1. If moving will NOT put ship inside: just move
 * 2. IF INSIDE:
 *  2.1 if near edge: go diagonal (land on circumference) in the direction most similar to desired_p
 *  2.2 if further in: go straight outward from circle center
 * 3. IF OUTSIDE:
 *  3.1 (if step1 wasnt triggered) go along tangent direction most similar to desired_p
 *```
 */
export function avoidCircle(
  position: Vec2,
  desired_p: Vec2,
  c: Vec2,
  r: number
): Vec2 {
  const p_moved = offsetmax20(position, desired_p);
  if (dist(c, p_moved) > r) {
    //moving wont put ship inside.. just move.
    return p_moved;
  }

  const dir_desired = unitvecFromPositions(position, desired_p);
  //const dir_center = unitvecFromPositions(position, c);
  const tps = tangentPoints(position, c, r);
  if (tps.length === 0) {
    //inside.
    if (dist(c, position) > r - 20) {
      //Ship is pretty close to circumference, there exists 2 "diagonal" moves to get outside
      //choose the one most similar to dir_desired
      const [a, b] = intersectTwoCircles(c, r, position, 20);
      const dir_diag0 = unitvecFromPositions(position, a);
      const dir_diag1 = unitvecFromPositions(position, b);
      const s0 = directionSimilarity(dir_diag0, dir_desired);
      const s1 = directionSimilarity(dir_diag1, dir_desired);
      const p_diag = s0 > s1 ? a : b;
      return p_diag;
    } else {
      //otherwise straight out
      return offset(c, position, r);
    }
  } else {
    //outside, there exists 2 tangent points
    //choose the one most similar to dir_desired
    const dir_tangent0 = unitvecFromPositions(position, tps[0]);
    const dir_tangent1 = unitvecFromPositions(position, tps[1]);
    const s0 = directionSimilarity(dir_tangent0, dir_desired);
    const s1 = directionSimilarity(dir_tangent1, dir_desired);
    const p_tangent = s0 > s1 ? tps[0] : tps[1];

    //const p_tangent_moved = offset(position, p_tangent, Math.min(20, dist(position, p_tangent)));

    const p_tangent_moved = offset(position, p_tangent, 20);
    return p_tangent_moved;
  }
}

/**
 * If outside, go inside
 * If inside go to the point inside closest to desired_p
 */
export function stayinCircle(
  position: Vec2,
  desired_p: Vec2,
  c: Vec2,
  r: number
): Vec2 {
  //the actual point Im going towards: the point closest desired_p BUT ALSO INSIDE
  const inside_p = offset(c, desired_p, Math.min(r, dist(c, desired_p)));

  const p_moved = offsetmax20(position, inside_p);
  if (dist(c, p_moved) <= r) {
    //moving wont put ship outside.. just move.
    return p_moved;
  } else if (dist(c, position) < r + 20) {
    //is outside but pretty close to circumference...
    const p = offset(c, position, r); //at border
    return p;
  } else {
    //is simply far outside, go toward center
    return offset(position, c, 20);
  }
}

/**
 * stay within range of star but toward desired_p, but avoid its collision radius when moving towar the inside point
 */
export function staynearstructure(
  position: Vec2,
  desired_p: Vec2,
  structure: Star | Base
): Vec2 {
  const D = 199.99999;

  const adjusted_p = stayinCircle(position, desired_p, structure.position, D);
  return avoidCircle(
    position,
    adjusted_p,
    structure.position,
    structure.collision_radius
  );
}

/**
 * ```raw
 * Try to stay in both circles, prioritize staying in c1.
 *
 * 1. Always stay inside c1
 * 2. If not possible to stay in both, stay in c1 but position toward c2
 * 3. If possible to stay in both, stay in both but position toward desired_p
 * ```
 */
export function stayinTwoCircles(
  position: Vec2,
  desired_p: Vec2,
  c1: Vec2,
  r1: number,
  c2: Vec2,
  r2: number
): Vec2 {
  //const [a, b] = intersectTwoCircles(c1, r1, c2, r2);
  //const p_inside = dist(a, desired_p) < dist(b, desired_p) ? a : b;
  if (dist(c1, c2) > r1 + r2) {
    //impossible, stay in c1, but toward c2
    return stayinCircle(position, c2, c1, r1);
  } else {
    //possible, go from betweenpoint toward desired_p but still inside both
    const between_p = mix(c1, c2);
    const p1 = nearestPointOfPoints(
      intersectLineCircle(between_p, desired_p, c1, r1),
      desired_p
    );
    const p2 = nearestPointOfPoints(
      intersectLineCircle(between_p, desired_p, c2, r2),
      desired_p
    );

    const p = dist(position, p1) < dist(position, p2) ? p1 : p2;
    const p_moved = offsetmax20(position, p);
    return p_moved;
  }
}
