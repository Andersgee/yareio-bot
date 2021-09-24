import collections from "../collections";
import { ship_closest } from "../find";
import move_combat from "./move_combat";
import { almostFull, isEmpty } from "../utils";
import {
  avoidCircle,
  clamp,
  dist,
  isWithinDist,
  nearestPointOfPoints,
  offset,
} from "../vec";

/**
 * ```raw
 * 1. chase away from base
 * 2. counterattack
 *  2.1
 * ```
 */
export default function move_squarerushdef(targetps: Vec2s, busy: Vec): void {
  //we are now gathered.. tick >= 87 ...start playing the actual game
  //I might have 270 energy in 9 ships and enemy might have 300 energy in 3 ships

  const { myships, bases } = collections;
  /*
      targetps[ship.index] = offset(
        ship.nearestenemy.position,
        ship.position,
        179
      );
      */
  for (const ship of myships) {
    const d = dist(bases.me.position, ship.nearestenemy.position);
    targetps[ship.index] = offset(
      bases.me.position,
      ship.nearestenemy.position,
      Math.max(d - 179, bases.me.collision_radius + 5)
    );
  }

  move_combat(targetps);
  maybe_send_one_to_enemybase(targetps, busy);
  moveEmptyships_to_star(targetps, busy, bases.enemy.position);
}

function maybe_send_one_to_enemybase(targetps: Vec2s, busy: Vec): void {
  const { myships, enemyships, bases, stars } = collections;
  const myship = ship_closest(myships, bases.enemy.position) || null;
  if (!myship || enemyships.length > 1) {
    return;
  }
  const enemyship = ship_closest(enemyships, bases.me.position);

  const attackpoint = offset(bases.enemy.position, myship.position, 199.9);
  const mydist = dist(myship.position, attackpoint);
  const myoffset = bases.enemy.hp;
  const ticksToKillEnemy = mydist / 20 + myoffset;

  const enemy_attackpoint = offset(
    bases.me.position,
    enemyship.position,
    199.9
  );
  const enemydist = dist(enemyship.position, enemy_attackpoint);
  const enemyoffset = bases.me.hp;
  const ticksToKillMe = enemydist / 20 + enemyoffset;

  const requriedenergy = myship.size * bases.enemy.hp;

  const starposition = nearestPointOfPoints(
    [stars.me.position, stars.middle.position, stars.enemy.position],
    myship.position
  );
  const healpoint = offset(starposition, targetps[myship.index], 199.9);

  if (ticksToKillEnemy < ticksToKillMe) {
    if (myship.energy >= requriedenergy) {
      //go attack
      targetps[myship.index] = avoidCircle(
        myship.position,
        attackpoint,
        myship.nearestenemy.position,
        221
      );
      busy.push(myship.index);
      myship.shout("kek");
    } else {
      //heal before attack
      targetps[myship.index] = avoidCircle(
        myship.position,
        healpoint,
        myship.nearestenemy.position,
        221
      );
      busy.push(myship.index);
      myship.shout("almostkek");
    }
  }
}

/**
 * ```raw
 * 1. Empty ships will move to nearest star and stay there until full.
 * 2. Any ships currently near star will stay near star until full.
 * 1. Non-empty ships (which are not near star) will not be touched.
 * ```
 */
function moveEmptyships_to_star(
  targetps: Vec2s,
  busy: Vec,
  afterpoint: Vec2
): void {
  const { myships, bases, stars } = collections;

  const collisionradius = stars.me.collision_radius;
  for (const ship of myships) {
    const starposition = nearestPointOfPoints(
      [stars.me.position, stars.middle.position, stars.enemy.position],
      ship.position
    );
    const isnearstarposition = isWithinDist(ship.position, starposition);

    const d = clamp(
      dist(starposition, targetps[ship.index]),
      collisionradius,
      199.9
    );
    if (isnearstarposition) {
      if (almostFull(ship)) {
        targetps[ship.index] = afterpoint;
        busy.push(ship.index);
      } else {
        targetps[ship.index] = offset(starposition, targetps[ship.index], d);
        busy.push(ship.index);
      }
    } else {
      if (isEmpty(ship)) {
        targetps[ship.index] = offset(starposition, targetps[ship.index], d);
        busy.push(ship.index);
      }
    }
  }
}
