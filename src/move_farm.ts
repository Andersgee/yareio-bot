import { ships_at_positions, ships_not_in, ship_closest } from "./find";
import { n_sustainable_starfarmorders, n_FULL_starfarmorders } from "./utils";
import getCollections from "./collections";
import getPoints from "./points_of_interest";
import { isWithinDist, offset } from "./vec";

const collections = getCollections();
const points = getPoints();

function hasAnyInRange(ships: Ships, p: Vec2): boolean {
  return ships.filter((s) => isWithinDist(s.position, p, 200)).length > 0;
}

export default function move_farm(G: Graph, busy: Vec): Vec {
  const { stars, myships, info } = collections;

  //const hasHipsNearHomeeStar = myships.filter(s=>isWithinDist(s.position, stars.me.position, 200)).length>0
  //Determine if its worth positioning in chain or if should just swarm the point near star
  const onlyMoveToMiddlestar = !hasAnyInRange(myships, stars.middle.position);

  const shipsize = myships[0].size;
  const N_me = n_sustainable_starfarmorders(stars.me, shipsize);
  const N_middle = n_sustainable_starfarmorders(stars.middle, shipsize);

  const N_me_full = n_FULL_starfarmorders(stars.me, shipsize);
  const N_middle_full = n_FULL_starfarmorders(stars.middle, shipsize);

  let i = 0;
  let j = 0;
  for (let n = 0; n < Math.max(N_me, N_middle); n++) {
    //fill home and middle farming evenly, but start with home
    if (i < N_me) {
      move_homefarm(G, busy);
      i += 1;
    }
    if (j < N_middle) {
      move_middlefarm(G, busy, onlyMoveToMiddlestar);
      j += 1;
    }
  }

  //always prepare for next as long as not max farming
  const preparing: Vec = [];
  if (i < N_me_full) {
    move_homefarm_prepare(busy, preparing);
  }
  if (j < N_middle_full && N_middle !== 0) {
    move_middlefarm_prepare(busy, preparing);
  }
  return preparing;
}

/**
 * Move 4 ships but only if available
 */
function move_homefarm(G: Graph, busy: Vec): void {
  const { myships } = collections;
  if (ships_not_in(myships, busy).length < 4) {
    return;
  }

  const p = points.homefarm;
  const ps = [p.star, p.between, p.base, p.star];
  const s = ships_at_positions(myships, ps, busy);

  s[0].move(ps[0]);
  s[1].move(ps[1]);
  s[2].move(ps[2]);
  s[3].move(ps[0]);
}

/**
 * Move 4 ships but only if available
 */
function move_middlefarm(G: Graph, busy: Vec, onlyMoveToStar = false): void {
  const { myships } = collections;
  if (ships_not_in(myships, busy).length < 4) {
    return;
  }

  const p = points.middlefarm;
  let ps = [p.star, p.star, p.between, p.base];
  if (onlyMoveToStar) {
    ps = [p.star, p.star, p.star, p.star];
  }
  const s = ships_at_positions(myships, ps, busy);

  s[0].move(ps[0]);
  s[1].move(ps[1]);
  s[2].move(ps[2]);
  s[3].move(ps[3]);
}

/**
 * Move 1,2 or 3 ships but dont make them busy.
 */
function move_homefarm_prepare(busy: Vec, preparing: Vec): void {
  const { myships, bases } = collections;

  const p = points.homefarm;
  const p_almoststar = offset(p.star, p.between, 20);

  //let ps = [p_almoststar, p_almoststar, p.between, p.base]; //dont actually connect until sustainable

  let ps = [p.star, p.between, p.base, p_almoststar]; //conect, but only with 1 of the 2
  if (tick < 25) {
    ps = [p.base, p.between, p.base, p.between]; //stay near base at the very beginning
  } else if (tick > 100) {
    ps = [p_almoststar, p.between, p.base, p_almoststar]; //careful of overfarming (dont connect at all) later
  }

  const s1 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[0]) || null;
  if (s1) {
    s1.move(ps[0]);
    preparing.push(s1.index);
    s1.shout("p");
  }
  const s2 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[1]) || null;
  if (s2) {
    s2.move(ps[1]);
    preparing.push(s2.index);
    s2.shout("p");
  }
  const s3 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[2]) || null;
  if (s3) {
    s3.move(ps[2]);
    preparing.push(s3.index);
    s3.shout("p");
  }

  const s4 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[3]) || null;
  if (s4) {
    s4.move(ps[3]);
    preparing.push(s4.index);
    s4.shout("p");
  }
}

/**
 * Move 1,2 or 3 ships but dont make them busy.
 */
function move_middlefarm_prepare(busy: Vec, preparing: Vec): void {
  const { myships } = collections;

  const p = points.middlefarm;
  const ps = [p.star, p.star, p.between, p.base];

  const s1 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[0]) || null;
  if (s1) {
    s1.move(ps[0]);
    preparing.push(s1.index);
    s1.shout("pmid");
  }
  const s2 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[1]) || null;
  if (s2) {
    s2.move(ps[1]);
    preparing.push(s2.index);
    s2.shout("pmid");
  }
  const s3 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[2]) || null;
  if (s3) {
    s3.move(ps[2]);
    preparing.push(s3.index);
    s3.shout("pmid");
  }
  /*
  const s4 =
    ship_closest(ships_not_in(myships, busy.concat(preparing)), ps[3]) || null;
  if (s4) {
    s4.move(ps[3]);
    preparing.push(s4.index);
    s4.shout("pmid");
  }
  */
}
