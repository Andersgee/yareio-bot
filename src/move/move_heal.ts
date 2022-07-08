import { collections } from "../collections";
import { shipFromId, shipFromIndex, ships_in } from "../find";
import {
  dist,
  isWithinDist,
  nearestPointOfPoints,
  offset,
  unique,
} from "../vec";
import { enemyHasAnyWithinCircle } from "./move_strategic";
import { positionShipAtPoint } from "./positioning";
import { D } from "../constants";
import { canReachAnyStar } from "../utils";
import { avoidCircle } from "../positioning";

export default function move_heal(orders: Orders): void {
  const { myships, stars } = collections;
  const avoidingShouldHeal = ships_in(myships, orders.avoiding).filter(
    (s) => s.energy <= 0.3 * s.energy_capacity
  );
  const emptyShouldHeal = myships.filter(
    (s) => s.energy === 0 && !canReachAnyStar(s)
  );
  const mightAswellHealMid = myships.filter(
    (s) =>
      s.energy <= 0.6 * s.energy_capacity &&
      !s.locked &&
      isWithinDist(s.position, stars.middle.position, 300) &&
      !isWithinDist(s.position, stars.middle.position, 200)
  );
  const currentTickShouldHealShips = avoidingShouldHeal.concat(
    mightAswellHealMid,
    emptyShouldHeal
  );

  const shouldHealShips = updateMemoryMovingToHealIds(
    currentTickShouldHealShips
  );

  for (const ship of shouldHealShips) {
    const closestSafeStarPoint = getBestHealPoint(ship);
    const desired_p = avoidCircle(
      ship.position,
      closestSafeStarPoint,
      ship.nearestenemy.position,
      240
    );
    positionShipAtPoint(orders, ship, desired_p);
  }
  return;
}

/**
 * ```raw
 * combine currentTickShouldHealShips with memory.movingToHealIds
 *  - remove full/undefined/duplicate ships
 *  - update memory.movingToHealIds
 *  - return the actual ships (instead of the ids) that still needs to heal.
 * ```
 */
function updateMemoryMovingToHealIds(currentTickShouldHealShips: Ship[]) {
  const currentTickShouldHealIds = currentTickShouldHealShips.map((s) => s.id);

  const movingToHealIds = [
    ...new Set(memory.movingToHealIds.concat(currentTickShouldHealIds)),
  ]; //concat and unique

  const { myships } = collections;
  const shoulMoveToStar = movingToHealIds
    .map((id) => shipFromId(myships, id))
    .filter(
      (s) => s !== undefined && s.energy < s.energy_capacity
      // && !anyStarIsWithinDist(s.position, 200)
    ) as Ship[];

  memory.movingToHealIds = shoulMoveToStar.map((s) => s.id);
  return shoulMoveToStar;
}

/**
 * find a point near a star without an enemy near it. fallback to mid star.
 */
function getBestHealPoint(ship: Ship): Vec2 {
  const { stars } = collections;

  const allStars = [stars.big, stars.enemy, stars.me, stars.middle];
  const starPoints = allStars.map((star) =>
    offset(star.position, ship.position, D)
  );

  const safeStarPoints = starPoints.filter(
    (p) => !enemyHasAnyWithinCircle(p, 220)
  );
  if (safeStarPoints.length < 1) {
    const healpointMid = offset(stars.middle.position, ship.position, D);
    return healpointMid;
  }

  return nearestPointOfPoints(safeStarPoints, ship.position);
}
