import collections from "./collections";
import { ships_not_in, ship_closest } from "./find";
import points from "./points_of_interest";
import {
  all,
  any,
  avoidCircle,
  clamp,
  dist,
  isWithinDist,
  mix,
  offset,
} from "./vec";

import move_farm from "./move_farm";
import { moveclosest } from "./busy";
import move_combat from "./move_combat";
import {
  almostFull,
  isFull,
  meanposition,
  myOutpostEnergy,
  notFull,
} from "./utils";

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
  const { myships, stars, bases } = collections;
  const targetps: Vec2s = new Array(myships.length).fill(null);
  const busy: Vec = [];
  let nfarmers = 0;
  let nmidfarmers = 0;

  if (memory.enemyIsSquareRush && myships.length <= 9) {
    if (tick < 40) {
      move_farm(targetps, busy);
    } else {
      square_rush_defense(targetps, busy);
    }
  } else {
    //harass_early(targetps, busy);

    intercept_harassers(targetps, busy);
    guard_star(targetps, busy, stars.me.position, 400);
    harass_late(targetps, busy);
    if (myOutpostEnergy() > 200 && stars.middle.energy > 50) {
      guard_star(targetps, busy, stars.middle.position, 240);
    }
    control_mid(targetps, busy);

    [nfarmers, nmidfarmers] = move_farm(targetps, busy);
    move_remaining(targetps, nmidfarmers, busy);
    move_combat(targetps);
  }
  return [targetps, nfarmers, nmidfarmers];
}

function move_remaining(targetps: Vec2s, nmidfarmers: number, busy: Vec) {
  const { myships, bases } = collections;
  const p0 = points.middle.between;
  const p2 = offset(bases.enemy.position, bases.me.position, 380); // in sight
  const p1 = mix(p0, p2);
  const p3 = points.enemybase.inrange;
  const ps = [p0, p1, p2, p3];

  if (memory.gamestage === 1) {
    for (const p of ps) {
      for (let n = 0; n < nmidfarmers / 2; n++) {
        moveclosest(targetps, p, busy);
      }
    }
  }

  for (const ship of ships_not_in(myships, busy)) {
    moveclosest(targetps, p3, busy);
  }
}

function square_rush_defense(targetps: Vec2s, busy: Vec) {
  const { myships, bases, stars } = collections;
  const starpoint = points.homefarm.backward.star;
  //const basepoint = points.homefarm.forward.base;
  const basepoint = offset(
    bases.me.position,
    bases.enemy.position,
    bases.me.collision_radius + 1
  );
  for (const ship of myships) {
    if (tick < 55) {
      if (isFull(ship) && !isWithinDist(ship.position, stars.me.position)) {
        //go to defendplace
        targetps[ship.index] = basepoint;
      } else {
        //heal
        targetps[ship.index] = starpoint;
      }
    } else if (tick < 81) {
      //time to move (start tick 56)
      targetps[ship.index] = offset(
        bases.me.position,
        ship.nearestenemy.position,
        bases.me.collision_radius + 1
      );
    } else {
      const d = dist(ship.nearestenemy.position, bases.me.position);
      targetps[ship.index] = offset(
        bases.me.position,
        ship.nearestenemy.position,
        Math.max(d - 180, bases.me.collision_radius + 5)
      );
    }
  }
  if (tick > 84) {
    move_combat(targetps);
  }
}

function locate_harassers(margin = 21) {
  const { bases, enemyships } = collections;
  const enemyharassers = enemyships.filter((s) =>
    isWithinDist(s.position, bases.me.position, 400 + margin)
  );
  return enemyharassers;
}

function intercept_harassers(targetps: Vec2s, busy: Vec): void {
  const { myships, bases } = collections;

  const margin = 20;
  const enemyharassers = locate_harassers(margin);
  //const canAlmostAttack = any(enemyharassers.map((s) => isWithinDist(s.position, bases.me.position, 320)));
  if (bases.me.energy > bases.me.current_spirit_cost * 0.5) {
    for (const enemy of enemyharassers) {
      const d = dist(bases.me.position, enemy.position);
      const interceptpoint = offset(
        bases.me.position,
        enemy.position,
        clamp(d, bases.me.collision_radius + 1, 201 + margin)
      );
      let myPower = 0;
      while (myPower <= enemy.energy) {
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
}

function harass_late(targetps: Vec2s, busy: Vec): void {
  const { bases } = collections;
  if (myOutpostEnergy() > 600) {
    const p = offset(bases.enemy.position, bases.me.position, 399.99); // in sight
    moveclosest(targetps, p, busy);
  }
}

function harass_early(targetps: Vec2s, busy: Vec): void {
  const { myships, bases, enemyships, info, outposts } = collections;

  const enemyAbandonedBase = all(
    enemyships.map((s) => !isWithinDist(s.position, bases.enemy.position, 220))
  );

  if (tick < 61) {
    moveclosest(targetps, points.enemybase_harass.between, busy);
  } else {
    //circle around to backside, staying min 399 from base
    const ship = ship_closest(myships, points.enemybase_harass.behind);
    const attackpoint = offset(bases.enemy.position, ship.position, 199);
    const desired_p = enemyAbandonedBase
      ? attackpoint
      : points.enemybase_harass.behind;

    let adjusted_p = avoidCircle(
      ship.position,
      desired_p,
      ship.nearestenemy.position,
      221
    );

    if (!enemyAbandonedBase) {
      adjusted_p = avoidCircle(
        ship.position,
        adjusted_p,
        bases.enemy.position,
        399
      );
    }

    if (info.outpostcontrolIsEnemy) {
      adjusted_p = avoidCircle(
        ship.position,
        adjusted_p,
        outposts.middle.position,
        outposts.middle.range + 1
      );
    }

    targetps[ship.index] = adjusted_p;
    busy.push(ship.index);
  }
}

function guard_star(targetps: Vec2s, busy: Vec, c: Vec2, r = 300): void {
  const { myships, enemyships } = collections;
  const enemyshipsAtArea = enemyships.filter((s) =>
    isWithinDist(s.position, c, r)
  );

  //const friendPositions = myships.map((s) => s.position);
  //const friendStongWeights = myships.map((s) => s.energy + 1);
  //const friendstrongpoint = weightedmean(friendPositions, friendStongWeights);

  const collision_radius = 100; //star is 100
  for (const enemy of enemyshipsAtArea) {
    const d = dist(c, enemy.position);
    const interceptpoint = offset(
      c,
      enemy.position,
      clamp(d - 199, collision_radius + 1, 199)
    );
    //const interceptpoint = offset(enemy.position, friendstrongpoint, 199); //enemy position but toward "home"

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

function control_mid(targetps: Vec2s, busy: Vec): void {
  const { info } = collections;
  if (memory.gamestage === 0) {
    const fpm = points.star2middlefarm.mid;
    if (tick > 66 && !info.outpostcontrolIsEnemy) {
      moveclosest(targetps, fpm.star, busy);
    }
    if (tick > 100 && !info.outpostcontrolIsEnemy) {
      moveclosest(targetps, fpm.star, busy);
    }
  }

  if (memory.gamestage === 1) {
    if (myOutpostEnergy() < 200) {
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
      moveclosest(targetps, points.star2middlefarm.mid.starforward, busy);
    }
  }
}
