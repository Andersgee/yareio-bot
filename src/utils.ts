import { sum, distanceWeightedMean, isWithinDist } from "./vec";
import collections from "./collections";

/**
 * The minimum required energy a star needs to sustain itself at n farmers (farming half the time)
 */
export function sustainableStarEnergy(
  star: Star,
  n: number,
  shipsize: number
): number {
  if (star.energy === 1000) {
    return (n * 0.5 * shipsize - 2) / 0.02;
  } else {
    return (n * 0.5 * shipsize - 1) / 0.02;
  }
}
/**
 * Return 0 If I dont have outpost, else return the outpost energy
 */
export function myOutpostEnergy(): number {
  const { outposts, info } = collections;
  return info.outpostcontrolIsMe ? outposts.middle.energy : 0;
}

export function isFull(s: Ship | Star): boolean {
  return s.energy === s.energy_capacity;
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

export function notEmpty(ship: Ship): boolean {
  return ship.energy > 0;
}

export function notFull(ship: Ship): boolean {
  return ship.energy < ship.energy_capacity;
}

export function isEmpty(ship: Ship): boolean {
  return ship.energy === 0;
}

export function stargain(starenergy: number): number {
  return Math.round(2 + 0.02 * starenergy);
}

/**
 * The maximum number of farmers (taking energy half the time) possible at star max energy without star losing energy.
 */
export function maxStarFarmers(star: Star, shipsize: number): number {
  return Math.floor(stargain(star.energy_capacity) / (0.5 * shipsize));
}

/**
 * The maximum number of farmers (taking energy half the time) to still have star grow by atleast 1 each tick.
 */
export function sustainableStarFarmers(star: Star, shipsize: number): number {
  if (star.energy === 1000) {
    return Math.floor(stargain(star.energy) / (0.5 * shipsize));
  } else {
    return Math.floor((stargain(star.energy) - 1) / (0.5 * shipsize));
  }
}
/**
 * How much damage a ship does to another ship.
 */
export function attackdmg(ship: Ship): number {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
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
 * How much energy a ship loses (by energizing)
 */
export function lossFromAttacking(ship: Ship): number {
  //ship.size, but only as much energy as it has.
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

/*
function sum(v){
  let sum = 0;
  for (const x of v) {
    sum += x;
  }
  return sum;
}

function meanposition(ps) {
  //average position of ships, but weighted toward ships with more energy
  const x = sum(ps.map((p) => p[0]));
  const y = sum(ps.map((p) => p[1]));
  return [x / ps.length, y / ps.length];
}
*/
/*
function stargain(starenergy) {
  return 2 + 0.02 * starenergy;
}

function n_sustainable_starfarmorders(starenergy, shipsize) {
  const gain = stargain(starenergy);
  for (let n = 1; n < 100; n++) {
    const expected_stargain = gain - n * shipsize;
    if (expected_stargain < 1) {
      return n - 1;
    }
  }
  return 0;
}
*/

/**
 * True if any in ships isWithinDist d, default d=200
 */
export function anyShipIsWithinDist(ships: Ships, p: Vec2, d = 200): boolean {
  return ships.filter((s) => isWithinDist(s.position, p, d)).length > 0;
}
