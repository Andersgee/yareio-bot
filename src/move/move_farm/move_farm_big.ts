import collections from "../../collections";
import { ships_not_in, ship_closest } from "../../find";
import { staynearstructure } from "../../positioning";
import { maxStarSelfers, sustainableStarSelfers } from "../../utils";
import { offsetmax20 } from "../../vec";
import points from "../../points";

export default function move_farm_big(
  targetps: Vec2s,
  moving: Vec,
  farming: Vec,
  maxfarmfraction: number //how much of maxfarm should be allocated
): void {
  const { myships, stars } = collections;

  const shipsize = myships[0].size;
  const selfers_max = Math.floor(
    maxfarmfraction * maxStarSelfers(stars.big, shipsize)
  );

  let nselfers = 0;
  for (let n = 0; n < selfers_max; n++) {
    nselfers += position4ships(targetps, moving, farming);
  }
  if (nselfers < selfers_max) {
    nselfers += position3ships(targetps, moving, farming);
    nselfers += position2ships(targetps, moving, farming);
    nselfers += position1ship(targetps, moving, farming);
  }
}

function position4ships(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars } = collections;
  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 4) {
    return 0;
  }

  const s0 = ship_closest(myships, points.b1, moving);
  targetps[s0.index] = staynearstructure(s0.position, points.b1, stars.big);
  moving.push(s0.index);
  farming.push(s0.index);

  const s2 = ship_closest(myships, points.b2, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.b2);
  moving.push(s2.index);
  farming.push(s2.index);

  const s3 = ship_closest(myships, points.b3, moving);
  targetps[s3.index] = offsetmax20(s3.position, points.b3);
  moving.push(s3.index);
  farming.push(s3.index);

  const s1 = ship_closest(myships, points.b1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.b1, stars.big);
  moving.push(s1.index);
  farming.push(s1.index);

  return 1; //the amount of farmers each tick
}

function position3ships(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars } = collections;
  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 3) {
    return 0;
  }

  const s1 = ship_closest(myships, points.b1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.b1, stars.big);
  moving.push(s1.index);
  farming.push(s1.index);

  const s2 = ship_closest(myships, points.b2, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.b2);
  moving.push(s2.index);
  farming.push(s2.index);

  const s3 = ship_closest(myships, points.b3, moving);
  targetps[s3.index] = offsetmax20(s3.position, points.b3);
  moving.push(s3.index);
  farming.push(s3.index);

  return 0.5; //the amount of farmers each tick
}

function position2ships(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars } = collections;
  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 2) {
    return 0;
  }

  const s1 = ship_closest(myships, points.b1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.b1, stars.big);
  moving.push(s1.index);
  farming.push(s1.index);

  const s2 = ship_closest(myships, points.b2, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.b2);
  moving.push(s2.index);
  farming.push(s2.index);

  return 0; //the amount of farmers each tick
}

function position1ship(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars, bases } = collections;
  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 1) {
    return 0;
  }

  const s1 = ship_closest(myships, points.b1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.b1, stars.big);
  moving.push(s1.index);
  farming.push(s1.index);

  return 0; //the amount of farmers each tick
}
