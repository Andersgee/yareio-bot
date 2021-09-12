import collections from "./collections";
import { ships_not_in, ship_closest } from "./find";
import points from "./points_of_interest";
import { clamp, dist, isWithinDist, offset } from "./vec";

import move_farm from "./move_farm";
import { moveclosest } from "./busy";
import move_combat from "./move_combat";

/**
 * ```raw
 * The general idea is:
 * 1. Strategic orders
 * 2. Farm
 * 3. Remaining
 * 4. Combat (override any previous but use the desired movement as input)
 * ```
 */
export default function move(): [Vec2s, number, number] {
  const { myships } = collections;
  const targetps: Vec2s = new Array(myships.length).fill(null);
  const busy: Vec = [];

  intercept_harassers(targetps, busy);
  control_mid(targetps, busy);
  const [nfarmers, nmidfarmers] = move_farm(targetps, busy);
  move_remaining(targetps, busy);
  move_combat(targetps);

  return [targetps, nfarmers, nmidfarmers];
}

function move_remaining(targetps: Vec2s, busy: Vec) {
  const { myships } = collections;
  for (const ship of ships_not_in(myships, busy)) {
    //targetps[ship.index] = points.chaintoenemy[points.chaintoenemy.length - 1];
    targetps[ship.index] = points.enemybase.inrange;
  }
}

function locate_harassers(margin = 41) {
  const { bases, enemyships } = collections;
  const enemyharassers = enemyships.filter((s) =>
    isWithinDist(s.position, bases.me.position, 400 + margin)
  );
  return enemyharassers;
}

function intercept_harassers(targetps: Vec2s, busy: Vec) {
  const { myships, bases } = collections;
  const margin = 41;
  const enemyharassers = locate_harassers(margin);
  for (const enemy of enemyharassers) {
    const d = dist(bases.me.position, enemy.position);
    const interceptpoint = offset(
      bases.me.position,
      enemy.position,
      clamp(d - 199, bases.me.collision_radius + 1, 201 + margin)
    );
    let myPower = 0;
    while (myPower < enemy.energy) {
      const myship =
        ship_closest(ships_not_in(myships, busy), interceptpoint) || null;
      if (myship) {
        targetps[myship.index] = interceptpoint;
        busy.push(myship.index);
        myPower += myship.energy;
      } else {
        break;
      }
    }
  }
}

function control_mid(targetps: Vec2s, busy: Vec) {
  if (memory.gamestage < 1) {
    const fpm = points.star2middlefarm.mid;
    if (tick > 67) {
      moveclosest(targetps, fpm.star, busy);
    }
    if (tick > 90) {
      moveclosest(targetps, fpm.star, busy);
    }
  }
}
