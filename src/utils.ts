import { sum, distanceWeightedMean, isWithinDist } from "./vec";
import { collections } from "./collections";

/**
 * Return 0 If I dont have outpost, else return the outpost energy
 */
export function myOutpostEnergy(): number {
  const { outposts, info } = collections;
  return info.outpostcontrolIsMe ? outposts.middle.energy : 0;
}
/**
 * Return 0 If ENEMY dont have outpost, else return the outpost energy
 */
export function enemyOutpostEnergy(): number {
  const { outposts, info } = collections;
  return info.outpostcontrolIsEnemy ? outposts.middle.energy : 0;
}

/**
 * s.energy === s.energy_capacity
 */
export function isFull(s: Ship | Star): boolean {
  return s.energy === s.energy_capacity;
}

/**
 * s.energy >= s.energy_capacity - s.size * n
 */
export function almostFull(s: Ship, n = 1): boolean {
  return s.energy >= s.energy_capacity - s.size * n;
}

/**
 * s.energy <= s.size * n
 */
export function almostEmpty(s: Ship, n = 1): boolean {
  return s.energy <= s.size * n;
}

/**
 * ```raw
 * True if ship has energy to (fully) transfer n times. default n=1
 *
 * ship.energy >= ship.size * n
 * ```
 */
export function canTransfer(ship: Ship, n = 1): boolean {
  return ship.energy >= ship.size * n;
}

/**
 * ```raw
 * Has room for n heals and still not be completely full, default n=1
 *
 * ship.energy < ship.energy_capacity - ship.size * n;
 * ```
 */
export function hasRoomLess(ship: Ship, n = 1): boolean {
  return ship.energy < ship.energy_capacity - ship.size * n;
}

/**
 * ```raw
 * Has room for n heals, default n=1
 *
 * ship.energy <= ship.energy_capacity - ship.size * n;
 * ```
 */
export function hasRoom(ship: Ship, n = 1): boolean {
  return ship.energy <= ship.energy_capacity - ship.size * n;
}

/**
 * ship.energy > 0
 */
export function notEmpty(ship: Ship): boolean {
  return ship.energy > 0;
}

/**
 * ship.energy < ship.energy_capacity
 */
export function notFull(ship: Ship): boolean {
  return ship.energy < ship.energy_capacity;
}

/**
 * ship.energy === 0
 */
export function isEmpty(ship: Ship): boolean {
  return ship.energy === 0;
}

function star_gain(star: Star) {
  if (star.energy_capacity == 3000) {
    return 3 + 0.03 * star.energy;
  } else {
    return 2 + 0.02 * star.energy;
  }
}

function star_gain_max(star: Star) {
  if (star.energy_capacity == 3000) {
    return 3 + 0.03 * star.energy_capacity;
  } else {
    return 2 + 0.02 * star.energy_capacity;
  }
}

/**
 * ```raw
 * The maximum number of farmers (farming each tick) possible at star max energy. ignoring sustainable.
 * ```
 */
export function maxStarSelfers(star: Star, shipsize: number): number {
  return Math.floor(star_gain_max(star) / shipsize);
}

/**
 * The maximum number of farmers (farming each tick) to still have star grow by atleast 1 each tick.
 */
export function sustainableStarSelfers(star: Star, shipsize: number): number {
  if (star.energy === star.energy_capacity) {
    return Math.floor(star_gain(star) / shipsize);
  } else {
    return Math.floor((star_gain(star) - 1) / shipsize);
  }
}

/**
 * The amount of energy that ships can take from star and still have it grow.
 */
export function sustainableStarSelfingAmount(star: Star): number {
  if (star.energy === star.energy_capacity) {
    return star_gain(star);
  } else {
    return star_gain(star) - 1;
  }
}

/**
 * simply `star.energy`
 */
export function maxStarSelfingAmount(star: Star): number {
  return star.energy;
}

export function outpostdmg(outpost: Outpost): number {
  return outpost.energy < 500
    ? Math.min(2, outpost.energy)
    : Math.min(8, outpost.energy);
}

export function outpostlossFromAttacking(outpost: Outpost): number {
  return outpost.energy < 500
    ? Math.min(1, outpost.energy)
    : Math.min(4, outpost.energy);
}

/**
 * ```raw
 * How much damage a ship does to another ship.
 *
 * 2 * Math.min(ship.size, ship.energy)
 * ```
 */
export function attackdmg(ship: Ship): number {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
}

/**
 * ```raw
 * How much energy a ship loses (by energizing)
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */
export function lossFromAttacking(ship: Ship): number {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy);
}

/**
 * essentially ship.size, except when its almost full in which case its less.
 *
 */
export function gainFromSelfing(ship: Ship): number {
  //ship.size, but only as much energy as it has.
  return Math.min(ship.size, ship.energy_capacity - ship.energy);
}

/**
 * ```raw
 * How much energy a ship transfers (by energizing)
 *
 * note: actually same as lossFromAttacking() but use this for clarity when appropriate.
 *
 * Math.min(ship.size, ship.energy);
 * ```
 */
export function transferamount(ship: Ship): number {
  return Math.min(ship.size, ship.energy);
}

/**
 * Average position of ships, but weighted toward ships with more energy.
 * Also add 1 to each ship to avoid potential zero division.
 */
export function weightedmeanposition(ships: Ships): Vec2 {
  const x = sum(ships.map((s) => (s.energy + 1) * s.position[0]));
  const y = sum(ships.map((s) => (s.energy + 1) * s.position[1]));
  const energysum = sum(ships.map((s) => s.energy + 1));
  return [x / energysum, y / energysum];
}

/**
 * Average position of ships.
 */
export function meanposition(ships: Ships): Vec2 {
  const x = sum(ships.map((s) => s.position[0]));
  const y = sum(ships.map((s) => s.position[1]));
  return [x / ships.length, y / ships.length];
}

export function distanceWeightedMeanPosition(ships: Ships): Vec2 {
  const points = ships.map((s) => s.position);
  return distanceWeightedMean(points);
}

/**
 * True if any in ships isWithinDist d, default d=200
 */
export function anyShipIsWithinDist(ships: Ships, p: Vec2, d = 200): boolean {
  return ships.filter((s) => isWithinDist(s.position, p, d)).length > 0;
}

/**
 * true if ship can reach any star.
 *
 * assuming range 300 if locked (even if not fully at 300 yet)
 * and 200 if not locked
 */
export function canReachAnyStar(ship: Ship): boolean {
  return ship.locked
    ? anyStarIsWithinDist(ship.position, 300)
    : anyStarIsWithinDist(ship.position, 200);
}

/**
 * true if any star is within r of point
 */
export function anyStarIsWithinDist(point: Vec2, r: number): boolean {
  return starsWithinDist(point, r).length > 0;
}
export function starsWithinDist(point: Vec2, r: number): Star[] {
  const { stars } = collections;
  const structures = [stars.big, stars.enemy, stars.me, stars.middle];
  return structures.filter((s) => isWithinDist(point, s.position, r));
}

/**
 * ```raw
 * What a ship would cost to replace for enemy.
 *
 * note: the cost of the ship itself is NOT simply current_spirit_cost becuase the ship starts with some energy.
 * Examples:
 * 1. squares in early game cost 360 but get 100 so the ship itself only costs 260.
 * 2. triangles in early game cost 90 but get 30 so the ship itself only costs 60.
 * 3. circles in early game cost 25 but get 10 so the ship itself only costs 15.
 *
 * ```
 */
export function enemyShipCost(): number {
  const { bases, shapes } = collections;
  let cost = bases.enemy.current_spirit_cost;
  if (shapes.enemy === "squares") {
    cost -= 100;
  } else if (shapes.enemy === "circles") {
    cost -= 10;
  } else if (shapes.enemy === "triangles") {
    cost -= 30;
  }
  return cost;
}

/**
 * ```raw
 * What a ship would cost to replace for me.
 *
 * note: the cost of the ship itself is NOT simply current_spirit_cost becuase the ship starts with some energy.
 * For example squares in early game cost 360 but get 100 so the ship itself only cost 260.
 * ```
 */
export function myShipCost(): number {
  const { bases, shapes } = collections;
  let cost = bases.me.current_spirit_cost;
  if (shapes.me === "squares") {
    cost -= 100;
  } else if (shapes.me === "circles") {
    cost -= 10;
  } else if (shapes.me === "triangles") {
    cost -= 30;
  }
  return cost;
}

export function isNearStar(s: Ship): boolean {
  const { stars } = collections;
  return (
    isWithinDist(s.position, stars.me.position) ||
    isWithinDist(s.position, stars.middle.position) ||
    isWithinDist(s.position, stars.enemy.position)
  );
}

export function notNearStar(s: Ship): boolean {
  return !isNearStar(s);
}

export function controlIsMe(controlId: string): boolean {
  const { playerids } = collections;
  return controlId === playerids.me;
}

export function controlIsEnemy(controlId: string): boolean {
  const { playerids } = collections;
  return controlId === playerids.enemy;
}

export function controlIsNeutral(controlId: string): boolean {
  const { playerids } = collections;
  return controlId !== playerids.enemy && controlId != playerids.me;
}

/**
 * check if ship can reach target
 *
 * `isWithinDist(ship.position, target.position, ship.range)` but allows target to be a Vec2 aswell.
 */
export function canEnergize(ship: Ship, target: Target): boolean {
  const shipRange = ship.range;
  if (Array.isArray(target)) {
    //is just a Vec2 (without position property)
    return isWithinDist(ship.position, target, shipRange);
  } else {
    return isWithinDist(ship.position, target.position, shipRange);
  }
}
