import collections from "./collections";
import { myOutpostEnergy } from "./utils";
import {
  dist,
  intersectTwoCircles,
  mix,
  nearestPointOfPoints,
  offset,
} from "./vec";

const D = 199.999;

const points_of_interest = getPoints();
export default points_of_interest;

function getPoints() {
  return {
    homefarm: homefarmpoints(),
    middlefarm: middlefarmpoints(),
    middlefarm_outside: middlefarmpoints_outside(),
    middle: insideMiddlestarInsideOutpost(),
    middle_outside: insideMiddlestarOutsideOutpost(),
    enemyfarm: enemyfarmpoints_straight(),
    enemybase: enemybasepoints(),
    star2middlefarm: star2middlefarm(),
  };
}

function homefarmpoints() {
  const { bases, stars } = collections;
  const o = 60; //offset away from straight line
  const pf = offset(bases.me.position, bases.enemy.position, o);
  const p0f = offset(stars.me.position, pf, D);
  const p1f = offset(p0f, pf, D);
  const p2f = offset(p1f, pf, D);
  const forward = {
    star: p0f,
    between: p1f,
    base: p2f,
  };

  const pb = offset(bases.me.position, bases.enemy.position, -o);
  const p0b = offset(stars.me.position, pb, D);
  const p1b = offset(p0b, pb, D);
  const p2b = offset(p1b, pb, D);
  const backward = {
    star: p0b,
    between: p1b,
    base: p2b,
  };

  return { forward, backward };
}

function star2middlefarm(): {
  home: {
    star: Vec2;
    between: Vec2;
    base: Vec2;
  };
  mid: {
    starforward: Vec2;
    star: Vec2;
    between: Vec2;
    base: Vec2;
  };
} {
  const { stars, bases } = collections;

  const centerpoints = insideMiddlestarInsideOutpost();
  const middle = centerpoints.me;
  const forwardmiddle = centerpoints.between;

  const star = offset(stars.me.position, middle, D); //near star
  const between = offset(star, middle, D); //between
  const base = offset(bases.me.position, between, D);

  const base2 = nearestPointOfPoints(
    intersectTwoCircles(bases.me.position, D, base, D),
    stars.middle.position
  );
  const between1 = offset(base2, middle, D);

  const home = { star, between, base };
  const mid = {
    starforward: myOutpostEnergy() > 500 ? forwardmiddle : middle,
    star: middle,
    between: between1,
    base: base2,
  };
  return { home, mid };
}

function enemybasepoints() {
  const { bases } = collections;
  const a = offset(bases.enemy.position, bases.me.position, 199);
  const b = offset(bases.enemy.position, bases.me.position, 399);

  return {
    inrange: a,
    insight: b,
  };
}

function middlefarmpoints() {
  const { info } = collections;
  if (info.outpostcontrolIsEnemy) {
    return middlefarmpoints_outside();
  } else {
    return middlefarmpoints_inside();
  }
}

function enemyfarmpoints_straight() {
  const { bases, stars } = collections;
  const base = bases.enemy.position;
  const homestar = stars.enemy.position;

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

function middlefarmpoints_inside() {
  const { bases } = collections;
  const base = bases.me.position;

  const a = insideMiddlestarInsideOutpost().me;
  const b = offset(base, a, 199);
  const c = mix(a, b);
  return { star: a, between: c, base: b };
}

function middlefarmpoints_outside() {
  const { bases } = collections;
  const base = bases.me.position;

  const a = insideMiddlestarOutsideOutpost().me;
  const b = offset(base, a, 199);
  const c = mix(a, b);
  return { star: a, between: c, base: b };
}

function insideMiddlestarInsideOutpost() {
  const { bases, stars, outposts } = collections;
  const base = bases.me.position;
  const middlestar = stars.middle.position;
  const outpost = outposts.middle.position;

  const D = 199.999;

  const pmid = intersectTwoCircles(middlestar, D, outpost, D); //in range of both star and outpost
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

function insideMiddlestarOutsideOutpost() {
  const { bases, stars, outposts } = collections;
  const base = bases.me.position;
  const middlestar = stars.middle.position;
  const outpost = outposts.middle.position;

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
