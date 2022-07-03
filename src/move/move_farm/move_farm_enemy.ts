import collections from "../../collections";
import { ships_not_in, ship_closest } from "../../find";
import { staynearstructure } from "../../positioning";
import { maxStarSelfers, sustainableStarSelfers } from "../../utils";
import { offsetmax20 } from "../../vec";
import points from "../../points";

export default function move_farm_enemy(
  targetps: Vec2s,
  moving: Vec,
  farming: Vec,
  maxfarmfraction: number //how much of maxfarm should be allocated
): void {
  const { myships, stars } = collections;

  const shipsize = myships[0].size;
  const selfers_max = Math.floor(
    maxfarmfraction * maxStarSelfers(stars.enemy, shipsize)
  );

  let nselfers = 0;
  for (let n = 0; n < selfers_max; n++) {
    nselfers += position3ships(targetps, moving, farming);
  }
  if (nselfers < selfers_max) {
    nselfers += position2ships(targetps, moving, farming);
    nselfers += position1ship(targetps, moving, farming);
  }
}

function position3ships(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars, bases } = collections;

  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 3) {
    return 0;
  }

  const s0 = ship_closest(myships, points.e1, moving);
  targetps[s0.index] = staynearstructure(s0.position, points.e1, stars.enemy);
  moving.push(s0.index);
  farming.push(s0.index);

  const s1 = ship_closest(myships, points.e1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.e1, stars.enemy);
  moving.push(s1.index);
  farming.push(s1.index);

  const s2 = ship_closest(myships, points.e2, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.e2);
  moving.push(s2.index);
  farming.push(s2.index);

  return 1; //the amount of farmers each tick
}

function position2ships(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars, bases } = collections;

  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 2) {
    return 0;
  }

  const s1 = ship_closest(myships, points.e1, moving);
  targetps[s1.index] = staynearstructure(s1.position, points.e1, stars.enemy);
  moving.push(s1.index);
  farming.push(s1.index);

  const s2 = ship_closest(myships, points.e1, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.e1);
  moving.push(s2.index);
  farming.push(s2.index);

  return 0.5;
}

function position1ship(targetps: Vec2s, moving: Vec, farming: Vec): number {
  const { myships, stars, bases } = collections;

  const freeships = ships_not_in(myships, moving);
  if (freeships.length < 1) {
    return 0;
  }

  const s2 = ship_closest(myships, points.e1, moving);
  targetps[s2.index] = offsetmax20(s2.position, points.e1);
  moving.push(s2.index);
  farming.push(s2.index);

  return 0;
}
