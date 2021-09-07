import { sum } from "./vec";

export function isFull(s: Ship | Star) {
  return s.energy === s.energy_capacity;
}

/**
 * The amount of energy a star would get next tick.
 */
export function stargain(starenergy: number): number {
  return 2 + 0.02 * starenergy;
}

/**
 * The maximum number of CONTINOUSLY farming ships in order to still make the star grow by atleast 1 each tick.
 *
 * note: each starfarmorder creates 1 CONTINOUSLY farming ship. (but occupies 4)
 */
export function n_sustainable_starfarmorders(star: Star, shipsize: number) {
  const gain = stargain(star.energy);
  for (let n = 1; n < 100; n++) {
    const expected_stargain = gain - n * shipsize;
    if (expected_stargain < 1) {
      return n - 1;
    }
  }
  return 0;
}

/**
 * same as n_sustainable_starfarmorders BUT ASSUME STAR IS FULL
 */
export function n_FULL_starfarmorders(star: Star, shipsize: number) {
  const gain = stargain(star.energy_capacity);
  for (let n = 1; n < 100; n++) {
    const expected_stargain = gain - n * shipsize;
    if (expected_stargain < 1) {
      return n - 1;
    }
  }
  return 0;
}

/**
 * How much damage a ship does to another ship.
 */
export function attackdmg(ship: Ship): number {
  //2*ship.size, but only as much energy as it has.
  return 2 * Math.min(ship.size, ship.energy);
}

export function outpostdmg(outpost: Outpost) {
  return outpost.energy < 500 ? 2 : 8;
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
  //average position of ships, but weighted toward ships with more energy
  const x = sum(ships.map((s) => (s.energy + 1) * s.position[0]));
  const y = sum(ships.map((s) => (s.energy + 1) * s.position[1]));
  const energysum = sum(ships.map((s) => s.energy + 1));
  return [x / energysum, y / energysum];
}

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
