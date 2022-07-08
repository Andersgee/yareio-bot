import { collections } from "./collections";
import {
  dist,
  intersectPoint,
  intersectPointFarthest,
  mix,
  offset,
} from "./vec";
import { D_LONG } from "./constants";
import { controlIsMe } from "./utils";

const pointsLong = pointsOfInterest();
export { pointsLong };

function pointsOfInterest() {
  const { bases, stars, outposts, pylons } = collections;

  //home star and base
  const {
    farm: h1,
    front: h_def_front,
    side: h_def_side,
    back: h_def_back,
  } = defpoints(bases.me, stars.me, stars.enemy.position);

  //enemy star and base
  const {
    farm: e1,
    front: e_def_front,
    side: e_def_side,
    back: e_def_back,
  } = defpoints(bases.enemy, stars.enemy, stars.me.position);

  //mid star and base
  const {
    farm: m1,
    front: m_def_front,
    side: m_def_side,
    back: m_def_back,
  } = defpoints_mid(bases.middle, stars.middle, stars.enemy.position);

  //big star
  const b1 = offset(stars.big.position, bases.me.position, D_LONG);
  const b2 = offset(b1, bases.me.position, D_LONG); //between point, put fragment here
  const b3 = offset(bases.me.position, stars.big.position, D_LONG);

  //outpost
  const o1 = offset(stars.middle.position, outposts.middle.position, D_LONG);

  /** 199 from big base */
  const a_b = offset(bases.big.position, stars.big.position, 199);

  //outpost
  const a_p = offset(pylons.middle.position, outposts.middle.position, 199);

  return {
    h1,
    h_def_front,
    h_def_side,
    h_def_back,
    e1,
    e_def_front,
    e_def_side,
    e_def_back,
    m1,
    m_def_front,
    m_def_side,
    m_def_back,
    b1,
    b2,
    b3,
    o1,
    a_b,
    a_p,
  };
}

/**
 * 4 well spaces points around base such that a chain can go from
 * star -> h1 -> front -> side -> back
 *
 * AND
 *
 * if they are locked (range 300) covers the bases spawn block radius (400)
 */
function defpoints(base: Base, star: Star, fronttarget: Vec2) {
  const BASE2DEF = 202;

  const farm = offset(star.position, base.position, D_LONG);

  const corner1 = intersectPointFarthest(
    base.position,
    400,
    farm,
    D_LONG,
    fronttarget
  );
  const back = intersectPointFarthest(
    corner1,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  const corner2 = intersectPoint(base.position, 400, back, D_LONG, fronttarget);
  const side = intersectPoint(
    corner2,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  const corner3 = intersectPoint(base.position, 400, side, D_LONG, fronttarget);
  const front = intersectPoint(
    corner3,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  return { farm, back, side, front };
}

function defpoints_mid(base: Base, star: Star, fronttarget: Vec2) {
  const BASE2DEF = 202;
  const farm = offset(star.position, base.position, 100);

  const corner1 = intersectPointFarthest(
    base.position,
    400,
    farm,
    D_LONG,
    fronttarget
  );
  const back = intersectPointFarthest(
    corner1,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  const corner2 = intersectPointFarthest(
    base.position,
    400,
    back,
    D_LONG,
    fronttarget
  );
  const side = intersectPoint(
    corner2,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  const corner3 = intersectPoint(base.position, 400, side, D_LONG, fronttarget);
  const front = intersectPoint(
    corner3,
    D_LONG,
    base.position,
    BASE2DEF,
    fronttarget
  );

  return { farm, back, side, front };
}
