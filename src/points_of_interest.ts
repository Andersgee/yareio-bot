import getCollections from "./collections";
import { dist, intersectTwoCircles, mix, offset } from "./vec";

const collections = getCollections();

export default function getPoints() {
  const { stars, outposts, bases } = collections;
  const base = bases.me.position;
  const homestar = stars.me.position;
  const middlestar = stars.middle.position;
  const outpost = outposts.middle.position;

  const points = {
    homefarm: homefarmpoints(),
    middlefarm: middlefarmpoints(),
    middle: insideMiddlestarInsideOutpost(base, middlestar, outpost),
    middle_outside: insideMiddlestarOutsideOutpost(base, middlestar, outpost),
  };
  return points;
}

function homefarmpoints() {
  if (tick < 140) {
    return homefarmpoints_straight();
  } else {
    return homefarmpoints_offset().forward;
  }
}

function middlefarmpoints() {
  const { info } = collections;
  if (info.outpostcontrolIsEnemy) {
    return middlefarmpoints_outside();
  } else {
    return middlefarmpoints_inside();
  }
}

function homefarmpoints_straight() {
  const { bases, stars } = collections;
  const base = bases.me.position;
  const homestar = stars.me.position;

  const a = offset(homestar, base, 199); //star
  const b = offset(base, a, 199); //base
  const c = mix(a, b); //between
  //const c = offset(b, a, 199); //between
  return {
    star: a,
    between: c,
    base: b,
  };
}

function homefarmpoints_offset() {
  const { bases, stars, outposts } = collections;
  const base = bases.me.position;
  const homestar = stars.me.position;
  const outpost = outposts.middle.position;

  const ps = intersectTwoCircles(base, 199, homestar, 199 * 3);
  const d0 = dist(outpost, ps[0]);
  const d1 = dist(outpost, ps[1]);
  const base_forward = d0 < d1 ? ps[0] : ps[1]; //the point nearer outpost
  const base_backward = d0 < d1 ? ps[1] : ps[0];

  const between_forward = offset(base_forward, homestar, 199);
  const between_backward = offset(base_backward, homestar, 199);

  const star_forward = offset(homestar, base_forward, 199);
  const star_backward = offset(homestar, base_backward, 199);

  const forward = {
    star: star_forward,
    between: between_forward,
    base: base_forward,
  };
  const backward = {
    star: star_backward,
    between: between_backward,
    base: base_backward,
  };

  return { forward, backward };
}

function middlefarmpoints_inside() {
  const { bases, stars, outposts } = collections;
  const base = bases.me.position;
  const middlestar = stars.middle.position;
  const outpost = outposts.middle.position;

  const a = insideMiddlestarInsideOutpost(base, middlestar, outpost).me;
  const b = offset(base, a, 199);
  const c = mix(a, b);
  return { star: a, between: c, base: b };
}

function middlefarmpoints_outside() {
  const { bases, stars, outposts } = collections;
  const base = bases.me.position;
  const middlestar = stars.middle.position;
  const outpost = outposts.middle.position;

  const a = insideMiddlestarOutsideOutpost(base, middlestar, outpost).me;
  const b = offset(base, a, 199);
  const c = mix(a, b);
  return { star: a, between: c, base: b };
}

function insideMiddlestarInsideOutpost(
  base: Vec2,
  middlestar: Vec2,
  outpost: Vec2
) {
  const pmid = intersectTwoCircles(middlestar, 199, outpost, 199); //in range of both star and outpost
  const d0 = dist(base, pmid[0]);
  const d1 = dist(base, pmid[1]);
  const pmid_me = d0 < d1 ? pmid[0] : pmid[1];
  const pmid_enemy = d0 < d1 ? pmid[1] : pmid[0];
  const pmid_between = mix(pmid_me, pmid_enemy, 0.5);
  return {
    me: pmid_me,
    between: pmid_between,
    enemy: pmid_enemy,
  };
}

function insideMiddlestarOutsideOutpost(
  base: Vec2,
  middlestar: Vec2,
  outpost: Vec2
) {
  const pmid = intersectTwoCircles(middlestar, 199, outpost, 401); //in range of star but outside short range of outpost
  const d0 = dist(base, pmid[0]);
  const d1 = dist(base, pmid[1]);
  const pmid_me = d0 < d1 ? pmid[0] : pmid[1];
  const pmid_enemy = d0 < d1 ? pmid[1] : pmid[0];
  const pmid_between = mix(pmid_me, pmid_enemy, 0.5);
  const pmid_between_outside = offset(outpost, pmid_between, 401); //move it outside circle
  return {
    me: pmid_me,
    between: pmid_between_outside,
    enemy: pmid_enemy,
  };
}
