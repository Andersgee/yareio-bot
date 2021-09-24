import { dist, minimum } from "./vec";

/**
 * ```raw
 * Return the ship that is closest to point p.
 *
 * Note: Will return undefined if the passed ships array is empty.
 * ```
 */
export function ship_closest(ships: Ships, p: Vec2): Ship {
  const d = ships.map((ship) => dist(ship.position, p));
  const i = minimum(d).index;
  return ships[i];
}

/**
 * Return the N ships that is closest to point p.
 */
export function ships_closestN(ships: Ships, p: Vec2, N: number): Ships {
  const sortedships = ships
    .slice()
    .sort((a, b) => dist(a.position, p) - dist(b.position, p));
  return sortedships.slice(0, N);
}

/**
 * Smallest distance first
 */
export function sortByNearestenemyDistance(ships: Ships): Ships {
  return ships
    .slice()
    .sort(
      (a, b) =>
        dist(a.position, a.nearestenemy.position) -
        dist(b.position, b.nearestenemy.position)
    );
}

/**
 * Lowest energy first
 */
export function sortByShipenergy(ships: Ships): Ships {
  return ships.slice().sort((a, b) => a.energy - b.energy);
}

/**
 * Biggest energy first
 */
export function sortByShipenergyReverse(ships: Ships): Ships {
  return ships.slice().sort((a, b) => b.energy - a.energy);
}

/**
 * Return all ships that DOES have a ship.index listed in the vector indexes.
 */
export function ships_in(ships: Ships, indexes: Vec): Ships {
  return ships.filter((ship) => indexes.includes(ship.index));
}

/**
 * Return all ships that does NOT have a ship.index listed in the vector indexes.
 */
export function ships_not_in(ships: Ships, indexes: Vec): Ships {
  return ships.filter((ship) => !indexes.includes(ship.index));
}

/**
 * Return true if ship.index is in indexes
 */
export function is_in(ship: Ship, indexes: Vec): boolean {
  return indexes.includes(ship.index);
}

/**
 * Return true if ship.index is NOT in indexes
 */
export function not_in(ship: Ship, indexes: Vec): boolean {
  return !indexes.includes(ship.index);
}

/**
 * Return the ship with index i (if it)
 */
export function shipFromIndex(ships: Ships, i: number): Ship {
  for (const ship of ships) {
    if (ship.index === i) {
      return ship;
    }
  }
  console.warn(
    "shipFromIndex: No ship with index i exists in ships. returning first ship"
  );
  return ships[0];
}
