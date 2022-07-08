import { canJump, jumpCost, jumpPoint } from "../ability/jump";
import { collections } from "../collections";
import combateval from "../combateval";
import { D } from "../constants";
import { ships_not_in, ship_closest, ship_closest_to_point } from "../find";
import { stayinCircle } from "../positioning";
import { anyStarIsWithinDist, starsWithinDist } from "../utils";
import { dist, isWithinDist, offset, unique } from "../vec";
import { enemyHasAnyWithinCircle } from "./move_strategic";

function uniqueIds(v: string[]): string[] {
  return [...new Set(v)];
}

/**
 * positionClosestShipAtPoint() for multiple points
 */
export function position_at_points(orders: Orders, points: Vec2[]): number {
  let allocated = 0;
  for (const point of points) {
    allocated += positionClosestShipAtPoint(orders, point);
  }
  return allocated;
}

/**
 * return `0.5` or `0` which is the number of "selfers per tick" that was just added:
 *
 * note: Half the time an allocated ship will not be selfing. Thats where 0.5 comes from.
 *
 * Will return 0 if no ship was available.
 *
 * also: Lock the ship if the picked ship is at the point.
 * */
export function positionClosestShipAtPoint(
  orders: Orders,
  point: Vec2
): number {
  const { myships } = collections;
  const freeships = ships_not_in(myships, orders.moving);
  if (freeships.length < 1) {
    return 0;
  } else {
    const ship = ship_closest_to_point(freeships, point);
    return positionShipAtPoint(orders, ship, point);
  }
}

/**
 * position this ship at point, return 0.5 always
 */
export function positionShipAtPoint(
  orders: Orders,
  ship: Ship,
  point: Vec2
): number {
  orders.targetps[ship.index] = point;
  orders.moving.push(ship.index);

  const isLocked = ship.locked;
  //const isAtPoint = isWithinDist(s2.position, point, Number.EPSILON) //too small
  const isAtCorrectPlace = isWithinDist(ship.position, point, 0.00001);

  if (!isAtCorrectPlace && isLocked) {
    ship.unlock();
  }

  if (!isAtCorrectPlace && !isLocked) {
    jumpTowardPointIfGood(orders, ship, point);
  }

  if (isAtCorrectPlace && !isLocked) {
    ship.lock();
  }

  return 0.5;
}

/**
 * return true if we decided to jump and called ship.jump()
 * "if good" refers to some conditions, which I havn't completely decided yet.
 *
 * experiment...
 */
export function jumpTowardPointIfGood(
  orders: Orders,
  ship: Ship,
  point: Vec2
): boolean {
  const { myships, enemyships } = collections;

  const energyMargin = ship.size * 2;
  const landingPoint = jumpPoint(ship, point, energyMargin);
  /*
  if (!canJump(ship, point, energyMargin)) {
    //cant afford
    return false;
  }
*/

  if (isWithinDist(ship.position, landingPoint, 40)) {
    //could just walk (2 ticks)
    return false;
  }

  if (anyStarIsWithinDist(ship.position, 200)) {
    //never jump if already inside a star
    return false;
  }

  const relevantStars = starsWithinDist(landingPoint, 200);
  if (relevantStars.length === 0) {
    //dont ever jump to a point that is not near a star
    return false;
  }
  if (relevantStars[0].energy < 400) {
    //dont deplete energy without quick way to get it back..
    return false;
  }

  const enemyShipsNearLandingpoint = enemyships.filter((s) =>
    isWithinDist(s.position, landingPoint, 220)
  );
  const myShipsAlreadyAtLandingpoint = myships.filter((s) =>
    isWithinDist(s.position, landingPoint, 20)
  );

  const myShipsAtLandingpointNextTick = myShipsAlreadyAtLandingpoint.concat([
    ship,
  ]);

  //remember energy
  const prevEnergy = ship.energy * 1;
  //modify energy before combateval
  const spentEnergy = jumpCost(ship, landingPoint);
  ship.energy -= spentEnergy;

  const { myAdvantage } = combateval(
    myShipsAtLandingpointNextTick,
    enemyShipsNearLandingpoint
  );
  //restore energy
  ship.energy = prevEnergy;

  if (myAdvantage > -1) {
    ship.jump(landingPoint);
    return true;
  }

  return false;
}

/** an appropriate point for defending base from a blocking enemy ship */
export function interceptPoint(base: Base, enemy: Ship): Vec2 {
  const enemyDistFromBaseRadius =
    dist(base.position, enemy.position) - base.collision_radius;
  if (enemyDistFromBaseRadius > D) {
    return offset(enemy.position, base.position, D);
  } else {
    return offset(base.position, enemy.position, base.collision_radius + 1);
  }
}

/**
 * same as positionClosestShipAtPoint stay in circle with center c and radius r
 */
export function positionClosestShipAtPoint_stayInCircle(
  orders: Orders,
  point: Vec2,
  c: Vec2,
  r: number
): number {
  const { myships } = collections;
  const freeships = ships_not_in(myships, orders.moving);
  if (freeships.length < 1) {
    return 0;
  }

  const ship = ship_closest_to_point(freeships, point);

  orders.targetps[ship.index] = stayinCircle(ship.position, point, c, r);
  orders.moving.push(ship.index);

  const isLocked = ship.locked;
  //const isAtPoint = isWithinDist(s2.position, point, Number.EPSILON) //too small
  const isAtCorrectPlace = isWithinDist(ship.position, point, 0.00001);

  if (!isAtCorrectPlace && isLocked) {
    ship.unlock();
  }
  if (isAtCorrectPlace && !isLocked) {
    ship.lock();
  }

  return 0.5;
}
