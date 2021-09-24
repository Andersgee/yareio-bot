import collections from "../collections";
import { ships_not_in, ship_closest } from "../find";
import points from "../points_of_interest";
import { all, any, avoidCircle, dist, isWithinDist, mix, offset } from "../vec";

import move_farm from "./move_farm";
import move_squarerushdef from "./move_squarerushdef";
import { moveclosest } from "../busy";
import move_combat from "./move_combat";
import { isFull, myOutpostEnergy } from "../utils";
import combateval from "../combateval";
import textpoints from "../text";
import { countourshapes } from "../pixelart";

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
    if (tick < 31) {
      move_farm(targetps, busy);
    } else {
      squarerushdef(targetps, busy);
    }
  } else {
    //harass_early(targetps, busy);

    intercept_harassers(targetps, busy);
    //guard_star(targetps, busy, stars.me.position, 420);
    harass_late(targetps, busy);
    if (myOutpostEnergy() > 200 && stars.middle.energy > 50) {
      guard_star(targetps, busy, stars.middle.position, 240);
    }
    control_mid(targetps, busy);

    //move_pixelart(targetps, busy);
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

function move_pixelart(targetps: Vec2s, busy: Vec) {
  const { bases, outposts, stars } = collections;

  const place1 = mix(bases.me.position, stars.me.position, 0.5);
  const place = offset(place1, bases.enemy.position, 300);
  const scale = 7.2;

  //const ps = textpoints("GG", place, scale);

  const width = 9;
  const N = 12;
  const ps = countourshapes(width, place, scale * 1.3, N);

  for (const p of ps.triangle) {
    moveclosest(targetps, p, busy);
  }
}

function squarerushdef(targetps: Vec2s, busy: Vec) {
  const { myships, bases, stars } = collections;
  const starpoint = points.homefarm.forward.star;
  const basepoint = points.homefarm.forward.base;

  /*
  const D = 199.9;
  const dangerpoint = offset(bases.me.position, bases.enemy.position, 201);
  const basepoint = nearestPointOfPoints(
    intersectTwoCircles(dangerpoint, D, bases.me.position, D),
    stars.me.position
  );
  */

  const fp = points.homefarm.backward;
  //0-32: normal
  //33-43: 4-2-2
  //
  if (tick < 42) {
    //8 ships
    moveclosest(targetps, fp.star, busy);
    moveclosest(targetps, fp.star, busy);
    moveclosest(targetps, fp.star, busy);
    moveclosest(targetps, fp.star, busy);
    moveclosest(targetps, fp.star, busy);
    moveclosest(targetps, fp.between, busy);
    moveclosest(targetps, fp.base, busy);
    moveclosest(targetps, fp.base, busy);
  } else if (tick < 76) {
    for (const ship of myships) {
      if (tick < 47) {
        if (isFull(ship) && !isWithinDist(ship.position, stars.me.position)) {
          //go to defendplace
          targetps[ship.index] = basepoint;
        } else {
          //heal
          targetps[ship.index] = fp.star;
        }
      } else if (tick < 56) {
        if (isFull(ship) && !isWithinDist(ship.position, stars.me.position)) {
          //go to defendplace
          targetps[ship.index] = basepoint;
        } else {
          //heal
          targetps[ship.index] = starpoint;
        }
      } else if (tick < 76) {
        targetps[ship.index] = basepoint;
      }
    }
    move_combat(targetps);
  } else {
    //we are now gathered.. start playing the actual game
    //I might have 270 energy in 9 ships and enemy might have 300 energy in 3 ships
    move_squarerushdef(targetps, busy);
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
  const anyEnemyCanAlmostAttack = any(
    enemyharassers.map((s) => isWithinDist(s.position, bases.me.position, 320))
  );
  if (
    anyEnemyCanAlmostAttack ||
    bases.me.energy > bases.me.current_spirit_cost * 0.5
  ) {
    for (const enemy of enemyharassers) {
      const d = dist(bases.me.position, enemy.position);
      const interceptpoint = offset(
        bases.me.position,
        enemy.position,
        Math.max(d - 199, bases.me.collision_radius + 1)
      );
      let myAdvantage = 0;
      const allocatedships: Ships = [];

      while (myAdvantage <= 0) {
        const freeships = ships_not_in(myships, busy);
        const myship =
          ship_closest(
            freeships.filter((s) => s.energy > 3),
            interceptpoint
          ) || null;
        if (myship && freeships.length > 4) {
          targetps[myship.index] = interceptpoint;
          busy.push(myship.index);
          allocatedships.push(myship);
          myAdvantage = combateval(allocatedships, [enemy]).myAdvantage;
        } else {
          break;
        }
      }
    }
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
      Math.max(d - 199, collision_radius + 1)
    );
    //const interceptpoint = offset(enemy.position, friendstrongpoint, 199); //enemy position but toward "home"
    let myAdvantage = 0;
    const allocatedships: Ships = [];

    while (myAdvantage <= 0) {
      const freeships = ships_not_in(myships, busy);
      const myship =
        ship_closest(
          freeships.filter((s) => s.energy > 3),
          interceptpoint
        ) || null;
      if (myship && freeships.length > 8) {
        targetps[myship.index] = interceptpoint;
        busy.push(myship.index);
        allocatedships.push(myship);
        myAdvantage = combateval(allocatedships, [enemy]).myAdvantage;
      } else {
        break;
      }
    }
  }
}

function control_mid(targetps: Vec2s, busy: Vec): void {
  const { info, myships } = collections;
  const freeships = ships_not_in(myships, busy);
  if (
    memory.gamestage === 0 &&
    freeships.length > 4 &&
    !memory.enemyWasNearMyBase
  ) {
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
