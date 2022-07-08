import { dist, offset } from "../vec";

/**
 * all shapes can use jump() . Formula: jump cost = distance/4 + (size^2) / 4
 */
export function jumpCost(ship: Ship, point: Vec2): number {
  return dist(ship.position, point) / 4 + Math.pow(ship.size, 2) / 4;
}

/**
 * ```raw
 * The maximum distance a ship can jump.
 *
 * energyMargin is how much the ship needs to still have after completed jump. default 0.
 *
 * d/4 + (size^2)/4 = cost
 * d/4 = cost - (size^2)/4
 * d = 4*( cost - (size^2)/4 )
 * d = 4*cost - (size^2)
 *
 * maxDist = 4*shipEnergy - shipSize^2
 *
 * affordableDistance = 4*(shipEnergy-energyMargin) - shipSize^2
 * ```
 */
export function maxJumpDistance(ship: Ship, energyMargin = 0): number {
  return 4 * (ship.energy - energyMargin) - Math.pow(ship.size, 2);
}

/**
 * True if has enough energy to jump to point
 *
 * energyMargin is how much the ship needs to still have after completed jump. default 0.
 */
export function canJump(ship: Ship, point: Vec2, energyMargin = 0): boolean {
  return ship.energy - energyMargin >= jumpCost(ship, point);
}

/**
 * return the point ship would land at if it jumped toward target point.
 *
 * energyMargin is how much the ship needs to have (at least) after jumping
 *
 * 1. if CAN reach point: return point
 * 2. if CAN NOT reach point: return the maximum jumpable point in the point direction
 */
export function jumpPoint(ship: Ship, point: Vec2, energyMargin = 0): Vec2 {
  if (canJump(ship, point, energyMargin)) {
    return point;
  } else {
    const d = maxJumpDistance(ship, energyMargin);
    const reachablePoint = offset(ship.position, point, d);
    return reachablePoint;
  }
}
